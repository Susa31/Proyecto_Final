import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Image, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Card, TextInput, Text, Button, HelperText } from 'react-native-paper';
 
const Register = ({ navigation }) => {
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [nameUser, setNameUser] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.(com|co)$/;
        if (email.length > 0 && !emailRegex.test(email)) {
            setEmailError('The email is not valid');
        } else {
            setEmailError('');
        }

        if (password.length > 0 && password.length < 6) {
            setPasswordError('The password must be at least 6 characters');
        } else if (password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword) {
            setPasswordError('Incorrect passwords');
        } else {
            setPasswordError('');
        }

        const areFieldsFilled = name.trim() !== '' &&
                                lastName.trim() !== '' &&
                                email.trim() !== '' &&
                                nameUser.trim() !== '' &&
                                password.trim() !== '' &&
                                confirmPassword.trim() !== '';
        setIsFormValid(
            areFieldsFilled && 
            emailError === '' && 
            passwordError === '' 
        );
    }, [name, lastName, email, nameUser, password, confirmPassword]); 


    const handleSave = async () => {
        if (!isFormValid) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        const profileData = { name, lastName, nameUser};

        try {
            await registerUser(email, password, profileData);
            
            Alert.alert(
                'Account created',
                'Account created successfully',
                [
                    { 
                        text: 'OK', 
                        onPress: () => navigation.navigate('Login') 
                    }
                ]
            );
        } catch (error) {
            console.error("Account creation error: ", error.code);
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Error', 'This email is already registered.');
                setEmailError('This email is already in use.');
            } else if (error.code === 'auth/weak-password') {
                Alert.alert('Error', 'Password too weak.');
                setPasswordError('The password must be at least 6 characters.');
            } else {
                Alert.alert('Error', 'Try again.');
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
                    />
                    <Text style={styles.title}>Crear un perfil</Text>
                </View>
                <Card>
                    <Card.Content>
                        <TextInput label={'* Name'} value={name} onChangeText={setName} style={styles.input} left={<TextInput.Icon icon="account" />} mode='outlined' />
                        <TextInput label={'* Lastname'} value={lastName} onChangeText={setLastName} style={styles.input} left={<TextInput.Icon icon="account-outline" />} mode='outlined' />
                        <TextInput label={'* Username'} value={nameUser} onChangeText={setNameUser} style={styles.input} left={<TextInput.Icon icon="account-outline" />} mode='outlined' />
                        
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
                            error={!!passwordError && password.length < 6} 
                        />
                        <TextInput
                            label={'* Confirm Password'} value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input}
                            left={<TextInput.Icon icon="lock-check" />} mode='outlined'
                            secureTextEntry
                            error={!!passwordError} 
                        />
                        <HelperText type="error" visible={!!passwordError}>{passwordError}</HelperText>
                        
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoText}>* Campos obligatorios</Text>
                        </View>

                        <Button
                            mode='contained' onPress={handleSave} style={styles.button}
                            icon="account-plus" disabled={!isFormValid}
                        >
                            Crear Cuenta
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