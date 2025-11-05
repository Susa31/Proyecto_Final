// src/Screens/Login.js
import React, { useEffect, useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, StyleSheet, Image } from 'react-native'; 
import { Card, TextInput, Button, Text, ActivityIndicator, Divider } from 'react-native-paper'; 
import { loginService, signInWithGoogle } from "../config/firebaseService";
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';

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
                console.log("Login de Google cancelado");
            } else {
                console.error("Error de Google Login: ", error);
                Alert.alert('Google Login Error', 'An error occurred. Please try again.');
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <View style={styles.inner}>
                
                <Text style={styles.title}>Bienvenido</Text>
                
                <Card style={styles.card}>
                    <Card.Content>

                        <Image
                            source={LoginLogo} 
                            style={styles.profileImage}
                            resizeMode="contain" 
                            onError={(e) => console.log('Error loading image', e.nativeEvent.error)} 
                        />

                        <TextInput
                            label="User name"
                            value={nameUser}
                            onChangeText={setNameUser}
                            style={styles.input}
                            mode="outlined"
                            autoCapitalize="none"
                            disabled={isGoogleLoading || isLoading} 
                        />
                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            style={styles.input}
                            mode="outlined"
                            secureTextEntry 
                            disabled={isGoogleLoading || isLoading}
                        />

                        {isLoading ? (
                            <ActivityIndicator animating={true} size="large" style={{ marginVertical: 10 }} />
                        ) : (
                            <Button
                                mode="contained"
                                onPress={handleLogin}
                                style={styles.button}
                                icon="login"
                                disabled={isGoogleLoading} 
                            >
                                Login
                            </Button>
                        )}
                        <Button
                            mode="outlined" 
                            onPress={() => navigation.navigate('Register')} 
                            style={styles.button}
                            disabled={isGoogleLoading || isLoading}
                        >
                            Create a New Account
                        </Button>
                        
                        <Divider style={styles.divider} /> 

                        {isGoogleLoading ? (
                             <ActivityIndicator animating={true} size="large" style={{ marginVertical: 10 }} />
                        ) : (
                            <GoogleSigninButton
                                style={{ width: '100%', height: 48, marginTop: 10 }}
                                size={GoogleSigninButton.Size.Wide}
                                color={GoogleSigninButton.Color.Dark}
                                onPress={handleGoogleLogin}
                                disabled={isLoading} 
                            />
                        )}
                    </Card.Content>
                </Card>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5' 
    },
    inner: { 
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    profileImage: { 
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
        alignSelf: 'center'
    },
    title: {
        fontSize: 32, 
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: '#333'
    },
    card: {
        borderRadius: 12,
        elevation: 3,
        paddingTop: 10, 
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 10,
        paddingVertical: 4,
    },
    divider: {
        marginVertical: 20,
        height: 1,
    }
});

export default Login;