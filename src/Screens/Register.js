import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Card, TextInput, Text, Button, HelperText, Avatar, ActivityIndicator } from 'react-native-paper';
import { registerService } from "../config/firebaseService";
import { uploadImageToCloudinary } from "../config/imageService";
import { launchImageLibrary } from 'react-native-image-picker';


const Register = ({ navigation }) => {
    const [nameFull, setNameFull] = useState('');
    const [nameUser, setNameUser] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [nameUserError, setNameUserError] = useState(''); 
    const [isFormValid, setIsFormValid] = useState(false);
    
    const [imageUri, setImageUri] = useState(null); 
    const [isLoading, setIsLoading] = useState(false); 

    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.(com|co)$/;
        if (email.length > 0 && !emailRegex.test(email)) {
            setEmailError('The email address is invalid.');
        } else {
            setEmailError('');
        }

        if (password.length > 0 && password.length < 6) {
            setPasswordError('The password must be at least 6 characters long');
        } else if (password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword) {
            setPasswordError('The passwords do not match');
        } else {
            setPasswordError('');
        }
        
        const areFieldsFilled = nameFull.trim() !== '' &&
                                nameUser.trim() !== '' &&
                                email.trim() !== '' &&
                                password.trim() !== '' &&
                                confirmPassword.trim() !== '';
        
        setIsFormValid(
            areFieldsFilled && 
            emailError === '' && 
            passwordError === '' &&
            nameUserError === '' 
        );
    }, [nameFull, email, nameUser, password, confirmPassword, emailError, passwordError, nameUserError]); 

    useEffect(() => {
        if (nameUserError) {
            setNameUserError('');
        }
    }, [nameUser]);

    const handleSelectImage = () => {
        launchImageLibrary(
            { mediaType: 'photo', quality: 0.7 }, 
            (response) => {
                if (response.didCancel) {
                    console.log('User has cancelled image selection');
                } else if (response.errorCode) {
                    console.log('ImagePicker Error: ', response.errorMessage);
                } else {
                    const uri = response.assets[0].uri;
                    setImageUri(uri);
                }
            }
        );
    };

    const handleSave = async () => {
        if (!isFormValid) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        setIsLoading(true); 

        const profileData = { 
            nameFull: nameFull.trim(), 
            nameUser: nameUser.trim(),
            email: email.trim(),
            avatarUrl: null,
        };

        try {
            if (imageUri) {
                console.log("Uploading avatar to Cloudinary...");
                const avatarUrl = await uploadImageToCloudinary(imageUri);
                profileData.avatarUrl = avatarUrl;
            }

            await registerService(email.trim(), password, profileData);
            
            Alert.alert(
                'Created Account',
                'Successfully created account',
                [ { text: 'OK', onPress: () => navigation.navigate('Login') } ]
            );

        } catch (error) {
            console.error(" Error creating account: ", error.code, error.message);
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Error', 'This email is already registered.');
                setEmailError('This email is already in use.');
            } else if (error.message === 'auth/username-already-in-use') { 
                Alert.alert('Error', 'This username is already in use.');
                setNameUserError('This username is already in use.');
            } else if (error.code === 'auth/weak-password') {
                Alert.alert('Error', 'Password too weak.');
                setPasswordError('The password must be at least 6 characters long.');
            } else {
                Alert.alert('Error', 'An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={handleSelectImage}>
                        {imageUri ? (
                            <Avatar.Image size={100} source={{ uri: imageUri }} style={styles.avatar} />
                        ) : (
                            <Avatar.Icon size={100} icon="camera-plus" style={styles.avatar} />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.title}>Create a profile</Text>
                </View>
                
                <Card>
                    <Card.Content>
                        <TextInput 
                            label='* Full name' 
                            value={nameFull} 
                            onChangeText={setNameFull} 
                            style={styles.input} 
                            left={<TextInput.Icon icon="account" />} 
                            mode='outlined' 
                        />
            
                        <TextInput 
                            label='* Username' 
                            value={nameUser} 
                            onChangeText={setNameUser} 
                            style={styles.input} 
                            left={<TextInput.Icon icon="account-outline" />} 
                            mode='outlined' 
                            error={!!nameUserError} 
                            autoCapitalize="none"
                        />
                        <HelperText type="error" visible={!!nameUserError}>{nameUserError}</HelperText>

                        <TextInput
                            label={'* Email'} value={email} onChangeText={setEmail} style={styles.input}
                            keyboardType='email-address' autoCapitalize='none'
                            left={<TextInput.Icon icon="email" />} mode='outlined' error={!!emailError}
                        />
                        <HelperText type="error" visible={!!emailError}>{emailError}</HelperText>

                        <TextInput
                            label={'* Password'} value={password} onChangeText={setPassword} style={styles.input}
                            left={<TextInput.Icon icon="lock" />} mode='outlined'
                            secureTextEntry 
                            error={!!passwordError && password.length > 0} 
                        />
                        <TextInput
                            label={'* Confirm Password'} value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input}
                            left={<TextInput.Icon icon="lock-check" />} mode='outlined'
                            secureTextEntry
                            error={!!passwordError && confirmPassword.length > 0} 
                        />
                        <HelperText type="error" visible={!!passwordError}>{passwordError}</HelperText>
                        
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoText}>* Required fields</Text>
                        </View>

                        {isLoading ? (
                            <ActivityIndicator size="large" style={{ marginVertical: 10 }} />
                        ) : (
                            <Button
                                mode='contained' onPress={handleSave} style={styles.button}
                                icon="account-plus" disabled={!isFormValid}
                            >
                                Create Account
                            </Button>
                        )}

                    </Card.Content>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};//Closes Register

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        marginBottom: 12,
        backgroundColor: '#e0e0e0' 
    },
    profileImage: { //Not used anymore
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 4, 
    },
    infoContainer: {
        marginTop: 8,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 12,
        color: '#666',
    },
    button: {
        paddingVertical: 8,
    },
});//Closes styles

export default Register;
