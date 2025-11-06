import { auth, firestore } from './firebase'; 
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const USER_COLLECTION = 'users';
const TWEET_COLLECTION = 'Tweets'; 

export const loginService = async (nameUser, password) => {
    try {
        const userQuery = firestore()
            .collection(USER_COLLECTION)
            .where('nameUser', '==', nameUser.trim().toLowerCase());
        const querySnapshot = await userQuery.get();
        if (querySnapshot.empty) {
            throw new Error('auth/user-not-found'); 
        }
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const email = userData.email;
        if (!email) {
            throw new Error('auth/internal-error');
        }
        await auth().signInWithEmailAndPassword(email, password);
        return { ...userData, id: userDoc.id }; 
    } catch (error) {
        console.error("Login service error: ", error.message);
        throw new Error(error.message);
    }
};

export const registerService = async (email, password, profileData) => {
    try {
        const userQuery = firestore()
            .collection(USER_COLLECTION)
            .where('nameUser', '==', profileData.nameUser.trim().toLowerCase());

        const querySnapshot = await userQuery.get();

        if (!querySnapshot.empty) {
            throw new Error('auth/username-already-in-use'); 
        }
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        const userDocRef = firestore()
            .collection(USER_COLLECTION)
            .doc(user.uid);
        const newProfileData = {
            uid: user.uid, 
            nameFull: profileData.nameFull,
            nameUser: profileData.nameUser.trim().toLowerCase(), 
            email: user.email, 
            createdAt: firestore.FieldValue.serverTimestamp(),
            followersCount: 0, 
            followingCount: 0 
        };
        await userDocRef.set(newProfileData);
        return { ...newProfileData, id: user.uid }; 
    } catch (error) {
        console.error("Registration service error: ", error.code, error.message);
        throw error;
    }
};

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const { idToken, user: googleUser } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
    const user = userCredential.user; 
    
    if (userCredential.additionalUserInfo.isNewUser) {
      console.log("New Google user, create a profile in Firestore...");
      const userDocRef = firestore().collection(USER_COLLECTION).doc(user.uid);
      
      const newProfileData = {
        uid: user.uid,
        nameFull: user.displayName || 'Google User', 
        nameUser: (googleUser.givenName.toLowerCase() || 'user') + Math.floor(Math.random() * 10000), 
        email: user.email, 
        avatarUrl: user.photoURL, 
        createdAt: firestore.FieldValue.serverTimestamp(),
        followersCount: 0, 
        followingCount: 0 
      };
      
      await userDocRef.set(newProfileData);
      return { ...newProfileData, id: user.uid };
      
    } else {
      console.log("UExisting Google user, searching for profile...");
      const userDoc = await firestore().collection(USER_COLLECTION).doc(user.uid).get();
      
      if (!userDoc.exists) {
         const newProfileData = {
           uid: user.uid, nameFull: user.displayName || 'Google User', 
           nameUser: (googleUser.givenName.toLowerCase() || 'user') + Math.floor(Math.random() * 10000), 
           email: user.email, avatarUrl: user.photoURL, 
           createdAt: firestore.FieldValue.serverTimestamp(),
           followersCount: 0, followingCount: 0 
         };
         await firestore().collection(USER_COLLECTION).doc(user.uid).set(newProfileData);
         return { ...newProfileData, id: user.uid }; 
      }
      
      return { ...userDoc.data(), id: userDoc.id }; 
    }
  } catch (error) {
    console.error("Error in signInWithGoogle: ", error.code, error.message);
    throw error;
  }
};

export const publishTweet = async (tweetData) => {
    try {
        const dataToSave = {
            text: tweetData.content.trim(), 
            authorId: tweetData.authorId,
            authorNameFull: tweetData.fullname,
            authorNameUser: tweetData.username,
            createdAdd: firestore.FieldValue.serverTimestamp(),
            likes: [],
            comments: []
        };
        const docRef = await firestore()
            .collection(TWEET_COLLECTION)
            .add(dataToSave);
        return { ...dataToSave, id: docRef.id };
    } catch (error) {
        console.error("Error when posting: ", error);
        throw error;
    }
};

export const listenToFeedTweets = (myId, onUpdate) => {
    const followingRef = firestore()
      .collection(USER_COLLECTION)
      .doc(myId)
      .collection('following');
  
    return followingRef.onSnapshot(async (followingSnapshot) => {
      const followingIds = followingSnapshot.docs.map(doc => doc.id);
      const feedUserIds = [myId, ...followingIds];
  
      if (feedUserIds.length === 0) {
        onUpdate([]);
        return;
      }
  
      const chunks = [];
      while (feedUserIds.length > 0) {
        chunks.push(feedUserIds.splice(0, 10));
      }
  
      const allTweets = [];
  
      await Promise.all(chunks.map(async (chunk) => {
        const tweetsQuery = await firestore()
          .collection(TWEET_COLLECTION)
          .where('authorId', 'in', chunk)
          .orderBy('createdAdd', 'desc')
          .limit(100)
          .get();
  
        tweetsQuery.docs.forEach(doc => {
          const data = doc.data();
  
          const formattedComments = (data.comments || []).map(comment => {
            return {
              ...comment,
              createdAt: comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : comment.createdAt
            };
          });
  
          allTweets.push({
            id: doc.id,
            ...data,
            comments: formattedComments,
            createdAt: data.createdAdd?.toDate().toLocaleString() || new Date().toLocaleString()
          });
        });
      }));
  
      const sortedTweets = allTweets.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  
      onUpdate(sortedTweets);
    });
  };

export const followUser = async (myId, theirId) => {
    try {
        const batch = firestore().batch();
        const theirFollowersRef = firestore()
            .collection(USER_COLLECTION).doc(theirId)
            .collection('followers').doc(myId);
        batch.set(theirFollowersRef, { createdAt: firestore.FieldValue.serverTimestamp() });

        const myFollowingRef = firestore()
            .collection(USER_COLLECTION).doc(myId)
            .collection('following').doc(theirId);
        batch.set(myFollowingRef, { createdAt: firestore.FieldValue.serverTimestamp() });

        const theirUserRef = firestore().collection(USER_COLLECTION).doc(theirId);
        batch.update(theirUserRef, { followersCount: firestore.FieldValue.increment(1) });

        const myUserRef = firestore().collection(USER_COLLECTION).doc(myId);
        batch.update(myUserRef, { followingCount: firestore.FieldValue.increment(1) });

        await batch.commit();
        console.log(`Success: ${myId} now follows ${theirId}`);

    } catch (error) {
        console.error("Error when following user: ", error);
        throw error;
    }
};

export const unfollowUser = async (myId, theirId) => {
    try {
        const batch = firestore().batch();
        const theirFollowersRef = firestore()
            .collection(USER_COLLECTION).doc(theirId)
            .collection('followers').doc(myId);
        batch.delete(theirFollowersRef);

        const myFollowingRef = firestore()
            .collection(USER_COLLECTION).doc(myId)
            .collection('following').doc(theirId);
        batch.delete(myFollowingRef);

        const theirUserRef = firestore().collection(USER_COLLECTION).doc(theirId);
        batch.update(theirUserRef, { followersCount: firestore.FieldValue.increment(-1) });

        const myUserRef = firestore().collection(USER_COLLECTION).doc(myId);
        batch.update(myUserRef, { followingCount: firestore.FieldValue.increment(-1) });

        await batch.commit();
        console.log(`Success: ${myId} no longer follows ${theirId}`);

    } catch (error) {
        console.error("Error when unfollowing: ", error);
        throw error;
    }
};

export const checkIfFollowing = async (myId, theirId) => {
    try {
        const myFollowingRef = firestore()
            .collection(USER_COLLECTION).doc(myId)
            .collection('following').doc(theirId);
            
        const doc = await myFollowingRef.get();
        return doc.exists; 
    } catch (error) {
        console.error("Error checking if it continues: ", error);
        throw error;
    }
};

export const updateTweetLikes = async (tweetId, likesArray) => {
    try {
        const tweetRef = firestore().collection(TWEET_COLLECTION).doc(tweetId);
        await tweetRef.update({
            likes: likesArray 
        });
        console.log(`Updated likes for the tweet: ${tweetId}`);
    } catch (error) {
        console.error("Error updating likes: ", error);
        throw error;
    }
};

export const addCommentToTweet = async (tweetId, commentObject) => {
    try {
        const tweetRef = firestore().collection(TWEET_COLLECTION).doc(tweetId);
        await tweetRef.update({
            comments: firestore.FieldValue.arrayUnion(commentObject)
        });
        console.log(`Comment added to the tweet: ${tweetId}`);
    } catch (error) {
        console.error("Error adding comment: ", error);
        throw error;
    }
};