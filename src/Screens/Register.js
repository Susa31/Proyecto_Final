import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Image, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Card, TextInput, Text, Button, HelperText } from 'react-native-paper';
import {registerService} from "../config/firebaseService";

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

    const handleSave = async () => {
        if (!isFormValid) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        const profileData = { 
            nameFull: nameFull.trim(), 
            nameUser: nameUser.trim(),
            email: email.trim()
        };

        try {
            await registerService(email.trim(), password, profileData);
            
            Alert.alert(
                'Created Account',
                'Successfully created account',
                [
                    { 
                        text: 'OK', 
                        onPress: () => navigation.navigate('Login') 
                    }
                ]
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
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop' }}
                        style={styles.profileImage}
                        onError={(e) => console.log('Error loading image', e.nativeEvent.error)} 
                    />
                    <Text style={styles.title}>Crear un perfil</Text>
                </View>
                <Card>
                    <Card.Content>
                        <TextInput 
                            label='* Name Full' 
                            value={nameFull} 
                            onChangeText={setNameFull} 
                            style={styles.input} 
                            left={<TextInput.Icon icon="account" />} 
                            mode='outlined' 
                        />
    
                        <TextInput 
                            label='* User name' 
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

                        <Button
                            mode='contained' onPress={handleSave} style={styles.button}
                            icon="account-plus" disabled={!isFormValid}
                        >
                            Create Account
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};


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
    profileImage: {
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
});

export default Register;