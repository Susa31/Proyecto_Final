import React, { useEffect, useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Card, TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import {loginService} from "../config/firebaseService";

const Login = ({ navigation }) => {
    const [nameUser, setNameUser] = useState(''); 
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); 

    const handleLogin = async () => {
        if (!nameUser || !password) {sss
            Alert.alert('Incomplete fields', 'Enter your username and password.');
            return;
        }

        setIsLoading(true); 

        try {
            const user = await loginService(nameUser.trim(), password);
            console.log('Authenticated user:', user.id);
            navigation.replace('ViewUser'); 
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

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <View style={styles.inner}>
                <Text style={styles.title}>Bienvenido</Text>
                <Card style={styles.card}>
                    <Card.Content>
                        <TextInput
                            label="User name"
                            value={nameUser}
                            onChangeText={setNameUser}
                            style={styles.input}
                            mode="outlined"
                            autoCapitalize="none"
                        />
                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            style={styles.input}
                            mode="outlined"
                            secureTextEntry 
                        />

                        {isLoading ? (
                            <ActivityIndicator animating={true} size="large" style={{ marginVertical: 10 }} />
                        ) : (
                            <Button
                                mode="contained"
                                onPress={handleLogin}
                                style={styles.button}
                                icon="login"
                            >
                                Login
                            </Button>
                        )}
                        <Button
                            mode="outlined" 
                            onPress={() => navigation.navigate('Register')} 
                            style={styles.button}
                            disabled={isLoading} 
                        >
                            Create a New Account
                        </Button>
                    </Card.Content>
                </Card>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    card: {
        borderRadius: 12,
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 10,
    },
});

export default Login;