import React, { useEffect, useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Card, TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { loginUser } from '../Confing/firebaseService'; 

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); 

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Incomplete fields', 'Enter your email and password.');
            return;
        }

        setIsLoading(true); 

        try {
            const user = await loginUser(email, password);
            console.log('Authenticated user:', user.uid);
           
            navigation.replace('Home'); 
        } catch (error) {
            let friendlyMessage = 'Please try again.';
            switch (error.code) {
                case 'auth/user-not-found':
                    friendlyMessage = 'No user with this email was found.';
                    break;
                case 'auth/wrong-password':
                    friendlyMessage = 'The password is incorrect.';
                    break;
                case 'auth/invalid-email':
                    friendlyMessage = 'Invalid email.';
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
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            mode="outlined"
                            keyboardType="email-address"
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