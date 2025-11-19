import { auth, firestore } from './firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const USER_COLLECTION = 'users';
const TWEET_COLLECTION = 'Tweets';

const formatPostData = (doc, data) => {
    const formattedComments = (data.comments || []).map(comment => ({
        ...comment,
        createdAt: comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : (comment.createdAt || '')
    }));

    return {
        id: doc.id,
        ...data,
        comments: formattedComments,
        createdAt: data.createdAdd?.toDate().toLocaleString() || new Date().toLocaleString(),
        originalPostId: data.originalPostId || null,
        originalAuthorId: data.originalAuthorId || null,
    };
};

const checkRepostedStatus = async (posts, reposterUserId) => {
    const originalPostIds = posts
        .map(p => p.isRepost ? p.originalPostId : p.id)
        .filter(Boolean);

    if (originalPostIds.length === 0) return posts.map(p => ({ ...p, hasBeenRepostedByMe: false }));

    const postStatuses = {};
    
    for (let i = 0; i < originalPostIds.length; i += 10) {
        const chunkedIds = originalPostIds.slice(i, i + 10);
        
        try {
            const repostsSnapshot = await firestore()
                .collection(TWEET_COLLECTION)
                .where('originalPostId', 'in', chunkedIds)
                .where('authorId', '==', reposterUserId)
                .limit(100)
                .get();
            
            repostsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                postStatuses[data.originalPostId] = true;
            });
        } catch (error) {
            console.warn("Error checking repost status for chunk: ", error.message);
        }
    }

    return posts.map(post => {
        const targetId = post.isRepost ? post.originalPostId : post.id;
        return {
            ...post,
            hasBeenRepostedByMe: !!postStatuses[targetId]
        };
    });
};

const getTweetsForUserBatch = async (userIds) => {
    const allTweets = [];
    
    for (let i = 0; i < userIds.length; i += 10) {
        const userBatch = userIds.slice(i, i + 10);
        
        try {
            const tweetsQuery = await firestore()
                .collection(TWEET_COLLECTION)
                .where('authorId', 'in', userBatch)
                .orderBy('createdAdd', 'desc')
                .limit(100)
                .get();

            const batchTweets = tweetsQuery.docs.map(doc => 
                formatPostData(doc, doc.data())
            );
            allTweets.push(...batchTweets);
        } catch (error) {
            console.error("Error fetching tweets for user batch: ", error);
        }
    }
    
    return allTweets;
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

        console.log(`Fetching feed for ${feedUserIds.length} users (including self)`);

        if (feedUserIds.length === 0) {
            return [];
        }

        const allTweets = await getTweetsForUserBatch(feedUserIds);

        console.log(`Found ${allTweets.length} total tweets before processing`);

        const repostsToFetch = {};
        const postDataMap = {};
        const timelineItems = [];

        allTweets.forEach(post => {
            if (!post.isRepost) {
                postDataMap[post.id] = post;
            }
            
            if (post.isRepost && post.originalPostId) {
                repostsToFetch[post.originalPostId] = true;
            }
            
            timelineItems.push(post);
        });

        const missingOriginalIds = Object.keys(repostsToFetch).filter(id => !postDataMap[id]);
        console.log(`Fetching ${missingOriginalIds.length} missing original posts for reposts`);
        
        if (missingOriginalIds.length > 0) {
            for (let i = 0; i < missingOriginalIds.length; i += 10) {
                const chunkedIds = missingOriginalIds.slice(i, i + 10);
                
                try {
                    const missingPostsQuery = await firestore()
                        .collection(TWEET_COLLECTION)
                        .where(firestore.FieldPath.documentId(), 'in', chunkedIds)
                        .get();

                    missingPostsQuery.docs.forEach(doc => {
                        postDataMap[doc.id] = formatPostData(doc, doc.data());
                    });
                } catch (error) {
                    console.warn("Error fetching missing posts chunk: ", error);
                }
            }
        }
        
        let finalFeed = timelineItems.map(item => {
            if (item.isRepost && item.originalPostId) {
                const originalPost = postDataMap[item.originalPostId];
                
                if (originalPost) {
                    return {
                        ...item,
                        originalPostId: originalPost.id,
                        originalAuthorId: originalPost.authorId,
                        text: originalPost.text,
                        mediaUrl: originalPost.mediaUrl,
                        mediaType: originalPost.mediaType,
                        repostCount: originalPost.repostCount,
                        likes: originalPost.likes,
                        comments: originalPost.comments,
                        originalAuthorNameFull: originalPost.authorNameFull,
                        originalAuthorNameUser: originalPost.authorNameUser,
                    };
                }
                console.log(`Missing original post for repost: ${item.originalPostId}`);
                return null;
            }
            return item;
        }).filter(Boolean);

        finalFeed.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });

        finalFeed = finalFeed.slice(0, 200);

        finalFeed = await checkRepostedStatus(finalFeed, myId);

        console.log(`Final feed: ${finalFeed.length} posts from ${new Set(finalFeed.map(p => p.authorNameUser || p.originalAuthorNameUser)).size} users`);

        return finalFeed;

    } catch (error) {
        console.error("Error getting feed: ", error);
        throw error;
    }
};

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
        console.error("Error in login service: ", error.message);
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
            followingCount: 0,
            postsCount: 0,
            repostsCount: 0,
        };
        await userDocRef.set(newProfileData);
        return { ...newProfileData, id: user.uid };
    } catch (error) {
        console.error("Error in register service: ", error.code, error.message);
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
            console.log("New Google user, creating Firestore profile...");
            const userDocRef = firestore().collection(USER_COLLECTION).doc(user.uid);
            const newProfileData = {
                uid: user.uid,
                nameFull: user.displayName || 'Google User',
                nameUser: (googleUser.givenName.toLowerCase() || 'user') + Math.floor(Math.random() * 10000),
                email: user.email,
                avatarUrl: user.photoURL,
                createdAt: firestore.FieldValue.serverTimestamp(),
                followersCount: 0,
                followingCount: 0,
                postsCount: 0,
                repostsCount: 0,
            };
            await userDocRef.set(newProfileData);
            return { ...newProfileData, id: user.uid };
        } else {
            console.log("Existing Google user, fetching profile...");
            const userDoc = await firestore().collection(USER_COLLECTION).doc(user.uid).get();
            if (!userDoc.exists) {
                const newProfileData = {
                    uid: user.uid, nameFull: user.displayName || 'Google User',
                    nameUser: (googleUser.givenName.toLowerCase() || 'user') + Math.floor(Math.random() * 10000),
                    email: user.email, avatarUrl: user.photoURL,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    followersCount: 0, followingCount: 0,
                    postsCount: 0,
                    repostsCount: 0,
                };
                await firestore().collection(USER_COLLECTION).doc(user.uid).set(newProfileData);
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
        const batch = firestore().batch();
        const newPostRef = firestore().collection(TWEET_COLLECTION).doc();
        const dataToSave = {
            text: tweetData.content.trim(),
            authorId: tweetData.authorId,
            authorNameFull: tweetData.fullname,
            authorNameUser: tweetData.username,
            createdAdd: firestore.FieldValue.serverTimestamp(),
            mediaUrl: tweetData.mediaUrl || null,
            mediaType: tweetData.mediaType || null,
            likes: [],
            comments: [],
            isRepost: false,
            repostCount: 0,
        };
        batch.set(newPostRef, dataToSave);
        const userRef = firestore().collection(USER_COLLECTION).doc(tweetData.authorId);
        batch.update(userRef, { postsCount: firestore.FieldValue.increment(1) });
        await batch.commit();
        return { ...dataToSave, id: newPostRef.id };
    } catch (error) {
        console.error("Error publishing post: ", error);
        throw error;
    }
};

export const followUser = async (myId, theirId) => {
    try {
        if (!myId || !theirId || typeof myId !== 'string' || typeof theirId !== 'string') {
            console.error(`Missing IDs: myId=${myId}, theirId=${theirId}`);
            throw new Error('Invalid user IDs provided');
        }

        const theirUserRef = firestore().collection(USER_COLLECTION).doc(theirId);
        const myUserRef = firestore().collection(USER_COLLECTION).doc(myId);

        const [theirDoc, myDoc] = await Promise.all([theirUserRef.get(), myUserRef.get()]);

        if (!theirDoc.exists || !myDoc.exists) {
            console.error(`Missing profile: Target(${theirId})=${theirDoc.exists}, Current(${myId})=${myDoc.exists}`);
            throw new Error('firestore/not-found: User document missing');
        }
        
        const batch = firestore().batch();
        
        const theirFollowersRef = firestore()
            .collection(USER_COLLECTION).doc(theirId)
            .collection('followers').doc(myId);
        batch.set(theirFollowersRef, { createdAt: firestore.FieldValue.serverTimestamp() });
        
        const myFollowingRef = firestore()
            .collection(USER_COLLECTION).doc(myId)
            .collection('following').doc(theirId);
        batch.set(myFollowingRef, { createdAt: firestore.FieldValue.serverTimestamp() });
        
        batch.update(theirUserRef, { followersCount: firestore.FieldValue.increment(1) });
        batch.update(myUserRef, { followingCount: firestore.FieldValue.increment(1) });
        
        await batch.commit();
    } catch (error) {
        console.error("Error following user: ", error.message);
        throw error;
    }
};

export const unfollowUser = async (myId, theirId) => {
    try {
        const theirUserRef = firestore().collection(USER_COLLECTION).doc(theirId);
        const myUserRef = firestore().collection(USER_COLLECTION).doc(myId);

        const [theirDoc, myDoc] = await Promise.all([theirUserRef.get(), myUserRef.get()]);
        if (!theirDoc.exists || !myDoc.exists) {
            throw new Error('firestore/user-not-found: One user profile missing for unfollow');
        }

        const theirFollowersRef = firestore()
            .collection(USER_COLLECTION).doc(theirId)
            .collection('followers').doc(myId);
        
        const myFollowingRef = firestore()
            .collection(USER_COLLECTION).doc(myId)
            .collection('following').doc(theirId);

        const followerDoc = await theirFollowersRef.get();
        const followingDoc = await myFollowingRef.get();
        
        let operationPerformed = false;
        const batch = firestore().batch();
        
        if (followerDoc.exists) {
            batch.delete(theirFollowersRef);
            operationPerformed = true;
        }

        if (followingDoc.exists) {
            batch.delete(myFollowingRef);
            operationPerformed = true;
        }

        if (operationPerformed) {
            batch.update(theirUserRef, { followersCount: firestore.FieldValue.increment(-1) });
            batch.update(myUserRef, { followingCount: firestore.FieldValue.increment(-1) });
        } else {
            return;
        }

        await batch.commit();
    } catch (error) {
        console.error("Error unfollowing user: ", error);
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
    } catch (error) {
        console.error("Error adding comment: ", error);
        throw error;
    }
};

export const updateUserProfile = async (userId, dataToUpdate) => {
    try {
        const userRef = firestore().collection(USER_COLLECTION).doc(userId);
        await userRef.update(dataToUpdate);
    } catch (error) {
        console.error("Error updating profile: ", error);
        throw error;
    }
};

export const updateUserDescription = async (userId, newDescription) => {
    try {
        const userRef = firestore().collection(USER_COLLECTION).doc(userId);
        await userRef.update({
            description: newDescription
        });
    } catch (error) {
        console.error("Error updating description: ", error);
        throw error;
    }
};

export const toggleRepost = async (originalPostId, reposterUserId) => {
    try {
        const originalPostRef = firestore().collection(TWEET_COLLECTION).doc(originalPostId);
        const reposterUserRef = firestore().collection(USER_COLLECTION).doc(reposterUserId);

        const repostQuery = firestore()
            .collection(TWEET_COLLECTION)
            .where('originalPostId', '==', originalPostId)
            .where('authorId', '==', reposterUserId)
            .limit(1);

        const snapshot = await repostQuery.get();
        const existingRepostDoc = snapshot.docs[0];

        const batch = firestore().batch();

        if (existingRepostDoc) {
            console.log("Existing repost found, deleting it.");
            const existingRepostRef = existingRepostDoc.ref;
            
            batch.delete(existingRepostRef);
            batch.update(reposterUserRef, { repostsCount: firestore.FieldValue.increment(-1) });
            batch.update(originalPostRef, { repostCount: firestore.FieldValue.increment(-1) });

            await batch.commit();
            return { action: 'deleted', repostId: existingRepostDoc.id };

        } else {
            console.log("No existing repost found, creating a new one.");
            const newPostRef = firestore().collection(TWEET_COLLECTION).doc();
            
            const originalPostDoc = await originalPostRef.get();
            if (!originalPostDoc.exists) {
                throw new Error("Original post does not exist.");
            }
            const originalPostData = originalPostDoc.data();

            const reposterDoc = await reposterUserRef.get();
            const reposterData = reposterDoc.data();

            const newPostData = {
                authorId: reposterUserId,
                authorNameFull: reposterData.nameFull,
                authorNameUser: reposterData.nameUser,
                createdAdd: firestore.FieldValue.serverTimestamp(),
                isRepost: true,
                originalPostId: originalPostId,
                originalAuthorId: originalPostData.authorId,
                likes: [],
                comments: [],
                repostCount: 0,
            };
            
            batch.set(newPostRef, newPostData);
            batch.update(reposterUserRef, { repostsCount: firestore.FieldValue.increment(1) });
            batch.update(originalPostRef, { repostCount: firestore.FieldValue.increment(1) });

            await batch.commit();
            return { action: 'created', repostId: newPostRef.id };
        }
    } catch (error) {
        console.error("Error in toggle repost: ", error);
        throw error;
    }
};

export const getOriginalPostsForProfile = async (userId) => {
    try {
        const postsQuery = await firestore()
            .collection(TWEET_COLLECTION)
            .where('authorId', '==', userId)
            .where('isRepost', '==', false)
            .orderBy('createdAdd', 'desc')
            .limit(100)
            .get();
        
        const posts = postsQuery.docs.map(doc => formatPostData(doc, doc.data()));
        return posts;
    } catch (error) {
        console.error("Error getting original posts: ", error);
        throw error;
    }
};

export const getRepostsForProfile = async (userId) => {
    try {
        const postsQuery = await firestore()
            .collection(TWEET_COLLECTION)
            .where('authorId', '==', userId)
            .where('isRepost', '==', true)
            .orderBy('createdAdd', 'desc')
            .limit(100)
            .get();
        
        const repostItems = postsQuery.docs.map(doc => formatPostData(doc, doc.data()));
        
        const originalPostIds = repostItems.map(item => item.originalPostId).filter(Boolean);
        const originalPostsMap = {};
        
        if (originalPostIds.length > 0) {
            const originalPostsQuery = await firestore()
                .collection(TWEET_COLLECTION)
                .where(firestore.FieldPath.documentId(), 'in', originalPostIds.slice(0, 10))
                .get();
            
            originalPostsQuery.docs.forEach(doc => {
                originalPostsMap[doc.id] = formatPostData(doc, doc.data());
            });
        }
        
        let finalReposts = repostItems.map(repost => {
            const originalPost = originalPostsMap[repost.originalPostId];
            if (originalPost) {
                return {
                    ...repost,
                    originalPostId: originalPost.id,
                    originalAuthorId: originalPost.authorId,
                    text: originalPost.text,
                    mediaUrl: originalPost.mediaUrl,
                    mediaType: originalPost.mediaType,
                    repostCount: originalPost.repostCount,
                    likes: originalPost.likes,
                    comments: originalPost.comments,
                    originalAuthorNameFull: originalPost.authorNameFull,
                    originalAuthorNameUser: originalPost.authorNameUser,
                };
            }
            return null;
        }).filter(Boolean);

        return finalReposts;
    } catch (error) {
        console.error("Error getting reposts: ", error);
        throw error;
    }
};

export const getAllUserActivityForProfile = async (userId, currentUserIdForRepostCheck) => {
    try {
        const postsQuery = await firestore()
        .collection(TWEET_COLLECTION)
        .where('authorId', '==', userId)
        .orderBy('createdAdd', 'desc')
        .limit(100)
        .get();
        
        const timelineItems = postsQuery.docs.map(doc => formatPostData(doc, doc.data()));
        
        const repostItems = timelineItems.filter(item => item.isRepost);
        const originalPostIds = repostItems.map(item => item.originalPostId).filter(Boolean);
        const originalPostsMap = {};
        
        if (originalPostIds.length > 0) {
            const originalPostsQuery = await firestore()
                .collection(TWEET_COLLECTION)
                .where(firestore.FieldPath.documentId(), 'in', originalPostIds.slice(0, 10))
                .get();
            
            originalPostsQuery.docs.forEach(doc => {
                originalPostsMap[doc.id] = formatPostData(doc, doc.data());
            });
        }
        
        let finalActivity = timelineItems.map(item => {
            if (item.isRepost && originalPostsMap[item.originalPostId]) {
                const originalPost = originalPostsMap[item.originalPostId];
                return {
                    ...item,
                    originalPostId: originalPost.id,
                    originalAuthorId: originalPost.authorId,
                    text: originalPost.text,
                    mediaUrl: originalPost.mediaUrl,
                    mediaType: originalPost.mediaType,
                    repostCount: originalPost.repostCount,
                    likes: originalPost.likes,
                    comments: originalPost.comments,
                    originalAuthorNameFull: originalPost.authorNameFull,
                    originalAuthorNameUser: originalPost.authorNameUser,
                };
            }
            return item;
        });

        if (currentUserIdForRepostCheck) {
            finalActivity = await checkRepostedStatus(finalActivity, currentUserIdForRepostCheck);
        }

        return finalActivity;
        
    } catch (error) {
        console.error("Error getting user activity: ", error);
        throw error;
    }
};