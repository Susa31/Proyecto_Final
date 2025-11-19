import React, { useEffect, useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native'; 
import { Card, TextInput, Button, Text, ActivityIndicator, Divider } from 'react-native-paper'; 
import { loginService, signInWithGoogle } from "../config/firebaseService";
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { GlobalStyles } from '../Styles/Styles';

const LoginLogo = require('../Assets/zentroLogo.png'); 

const Login = ({ navigation }) => {
    const [nameUser, setNameUser] = useState(''); 
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); 
    const [isGoogleLoading, setIsGoogleLoading] = useState(false); 

    const handleLogin = async () => {
        if (!nameUser || !password) {
            Alert.alert('Incomplete fields', 'Enter your username and password.');
            return;
        }
        setIsLoading(true); 
        try {
            const userProfile = await loginService(nameUser.trim(), password);
            console.log('Authenticated user:', userProfile.id, userProfile.nameUser);
            navigation.replace('Feed', { user: userProfile }); 
        } catch (error) {
            let friendlyMessage = 'Please try again.';
            switch (error.message) { 
                case 'auth/user-not-found':
                    friendlyMessage = 'No user was found with that username.';
                    break;
                case 'auth/wrong-password':
                    friendlyMessage = 'The password is incorrect.';
                    break;
                default:
                    console.error("Authentication error:", error.code, error.message);
            }
            Alert.alert('Login error', friendlyMessage);
        } finally {
            setIsLoading(false); 
        }
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            const userProfile = await signInWithGoogle();
            console.log('Authenticated with Google:', userProfile.id, userProfile.nameUser);
            navigation.replace('Feed', { user: userProfile });
        } catch (error) {
            if (error.code === 'SIGN_IN_CANCELLED') {
                console.log("Google Login Cancelled");
            } else {
                console.error("Google Login Error: ", error);
                Alert.alert('Google Login Error', 'An error occurred. Please try again.');
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={GlobalStyles.authContainer}>
            <View style={GlobalStyles.authInner}>
                
                <Text style={GlobalStyles.authTitle}>Welcome to Zentro</Text>
                
                <Card style={GlobalStyles.authCard}>
                    <Card.Content>

                        <Image
                            source={LoginLogo} 
                            style={GlobalStyles.authProfileImage}
                            resizeMode="contain" 
                            onError={(e) => console.log('Error loading image', e.nativeEvent.error)} 
                        />

                        <TextInput
                            label="Username"
                            value={nameUser}
                            onChangeText={setNameUser}
                            style={GlobalStyles.authInput}
                            mode="outlined"
                            autoCapitalize="none"
                            disabled={isGoogleLoading || isLoading} 
                        />
                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            style={GlobalStyles.authInput}
                            mode="outlined"
                            secureTextEntry 
                            disabled={isGoogleLoading || isLoading}
                        />

                        {isLoading ? (
                            <ActivityIndicator animating={true} size="large" style={{ marginVertical: 10 }} />
                        ) : (
                            <Button
                                mode="contained"
                                buttonColor="#8A2BE2"
                                onPress={handleLogin}
                                style={GlobalStyles.authButton}
                                icon="login"
                                disabled={isGoogleLoading} 
                            >
                                Login
                            </Button>
                        )}
                        <Button
                            mode="outlined"
                            textColor="#8A2BE2"
                            theme={{ colors: { outline: "#8A2BE2" } }}
                            onPress={() => navigation.navigate('Register')} 
                            style={GlobalStyles.authButton}
                            disabled={isGoogleLoading || isLoading}
                        >
                            Create a New Account
                        </Button>
                        
                        <Divider style={GlobalStyles.authDivider} /> 

                        {isGoogleLoading ? (
                            <ActivityIndicator animating={true} size="large" style={{ marginVertical: 10 }} />
                        ) : (
                            <GoogleSigninButton
                                style={{ width: '100%', height: 48, marginTop: 10 }}
                                size={GoogleSigninButton.Size.Wide}
                                color={GoogleSigninButton.Color.Dark}
                                onPress={handleGoogleLogin}
                                disabled={false} 
                            />
                        )}
                    </Card.Content>
                </Card>
            </View>
        </KeyboardAvoidingView>
    );
};

export default Login;