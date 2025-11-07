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
            avatarUrl: profileData.avatarUrl || null,
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
      console.log("New Google user, creating profile in Firestore...");
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
      console.log("Existing Google user, searching for profile...");
      const userDoc = await firestore().collection(USER_COLLECTION).doc(user.uid).get();
      
      if (!userDoc.exists) {
         const newProfileData = {
           uid: user.uid, nameFull: user.displayName || 'Google user', 
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
            imageUrl: tweetData.imageUrl || null,
            likes: [],
            comments: []
        };
        const docRef = await firestore()
            .collection(TWEET_COLLECTION)
            .add(dataToSave);
        
        return { ...dataToSave, id: docRef.id };
    } catch (error) {
        console.error("Error when publishing Post: ", error);
        throw error;
    }
};

export const getFeedTweets = async (myId) => {
    try {
        const followingSnapshot = await firestore()
            .collection(USER_COLLECTION)
            .doc(myId)
            .collection('following')
            .get();
        
        const followingIds = followingSnapshot.docs.map(doc => doc.id);
        const feedUserIds = [myId, ...followingIds];

        const tweetsQuery = await firestore()
            .collection(TWEET_COLLECTION)
            .where('authorId', 'in', feedUserIds.slice(0, 10)) 
            .orderBy('createdAdd', 'desc') 
            .limit(100)
            .get();
            
        const tweets = tweetsQuery.docs.map(doc => {
            const data = doc.data();
            const formattedComments = (data.comments || []).map(comment => ({
                ...comment,
                createdAt: comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : (comment.createdAt || '')
            }));

            return {
                id: doc.id,
                ...data,
                comments: formattedComments,
                createdAt: data.createdAdd?.toDate().toLocaleString() || new Date().toLocaleString()
            };
        });
        
        return tweets;
        
    } catch (error) {
        console.error("Error getting the Feed: ", error);
        throw error;
    }
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
        console.error("Error checking if following: ", error);
        throw error;
    }
};

export const updateTweetLikes = async (tweetId, likesArray) => {
    try {
        const tweetRef = firestore().collection(TWEET_COLLECTION).doc(tweetId);
        await tweetRef.update({
            likes: likesArray 
        });
        console.log(`Updated likes for Post: ${tweetId}`);
    } catch (error) {
        console.error("Error when updating likes: ", error);
        throw error;
    }
};

export const addCommentToTweet = async (tweetId, commentObject) => {
    try {
        const tweetRef = firestore().collection(TWEET_COLLECTION).doc(tweetId);
        await tweetRef.update({
            comments: firestore.FieldValue.arrayUnion(commentObject)
        });
        console.log(`Comment added to Post: ${tweetId}`);
    } catch (error) {
        console.error("Error when adding the comment: ", error);
        throw error;
    }
};
/**
 *
 * @param {string} userId
 * @param {object} dataToUpdate
 */
export const updateUserProfile = async (userId, dataToUpdate) => {
    try {
        const userRef = firestore().collection(USER_COLLECTION).doc(userId);
        await userRef.update(dataToUpdate);
        console.log("Profile updated in Firestore with the Cloudinary URL");
    } catch (error) {
        console.error("Error when updating the profile: ", error);
        throw error;
    }
};
