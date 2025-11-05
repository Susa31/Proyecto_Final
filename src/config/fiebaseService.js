import { auth, firestore } from './firebase'; 

const USER_COLLECTION = 'users';

export const loginService = async (nameUser, password) => {
    try {
        const userQuery = firestore()
            .collection(USER_COLLECTION)
            .where('nameUser', '==', nameUser.trim().toLowerCase());
        
        const querySnapshot = await userQuery.get();

        if (querySnapshot.empty) {
            console.warn(`Login attempt failed: NameUser not found ${nameUser}`);
            throw new Error('auth/user-not-found'); 
        }

        const userDoc = querySnapshot.docs[0].data();
        const email = userDoc.email;

        if (!email) {
            console.error("Critical error: The user in Firestore does not have an email address.", userDoc);
            throw new Error('auth/internal-error');
        }

        console.log(`Logging in to ${nameUser} with email ${email}`);
        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        return userCredential.user;

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
            console.warn(`Registration attempt failed: The nameUser ${profileData.nameUser} already exists.`);
            throw new Error('auth/username-already-in-use'); 
        }

        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        const userDocRef = firestore()
            .collection(USER_COLLECTION)
            .doc(user.uid); 
    
        await userDocRef.set({
            uid: user.uid, 
            nameFull: profileData.nameFull,
            nameUser: profileData.nameUser.trim().toLowerCase(), 
            email: user.email, 
            createdAt: firestore.FieldValue.serverTimestamp(), 
            followersCount: 0, 
            followingCount: 0 
        });

        console.log("Registered user and profile created with ID: ", user.uid);
        return user; 

    } catch (error) {
        console.error("Registration service error: ", error.code, error.message);
        throw error; 
    }
};