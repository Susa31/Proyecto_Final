import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { Card, TextInput, Button, Text } from 'react-native-paper';
import { publishTweet } from '../config/firebaseService';

const PublishPost = ({ navigation, route }) => {
    const [content, setContent] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    
    const { user } = route.params; 

    useEffect(() => {
        const trimmed = content.trim();
        setCharCount(trimmed.length);
        setIsValid(trimmed.length > 0 && trimmed.length <= 280);
    }, [content]);

    const handlePublish = async () => {
        if (!isValid || isLoading || !user) {
            Alert.alert("Error", "Could not Publish. Make sure you are logged in and the content is valid.");
            return;
        }
        
        setIsLoading(true); 
        
        const newPostData = {
            content: content.trim(), 
            authorId: user.id,
            fullname: user.nameFull, 
            username: user.nameUser,
        };

        try {
            const publishedPost = await publishTweet(newPostData);

            if (route.params?.onPublish) {
                route.params.onPublish({ 
                    ...publishedPost,
                    text: publishedPost.text, 
                    createdAt: new Date().toLocaleString() 
                });
            }
            
            Alert.alert(
                'Published',
                'Your Post has been shared with the others!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        
        } catch (error) {
            console.error("Error when publishing: ", error);
            Alert.alert("Error", "Could not publish your Post. Please try again later");
            setIsLoading(false); 
        }
    };

    return (
    <ScrollView style={styles.container}>
        <View style={styles.innerContainer}>
        <Card style={styles.card}>
            <Card.Content>
            <Text style={styles.title}>
                Post something here!
            </Text>

            <TextInput
                label="What do you have in mind?"
                value={content}
                onChangeText={setContent}
                multiline
                mode="outlined"
                maxLength={280}
                style={{ marginBottom: 10 }}
            />
            
            <Text style={styles.charCount}>{charCount}/280</Text> 

            <Button
                mode="contained"
                buttonColor="#8A2BE2"
                onPress={handlePublish}
                icon="send" 
                disabled={!isValid || isLoading}
                loading={isLoading} 
            >
            Publish
            </Button>
            </Card.Content>
        </Card>
      </View>
    </ScrollView>
    );
};//Closes PublishPost

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5'
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        paddingTop: 50
    },
    card: {
        borderRadius: 12,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 15,
        fontWeight: 'bold'
    },
    charCount: {
        textAlign: 'right',
        color: 'gray',
        marginBottom: 10
    }
});//Closes Styles

export default PublishPost;
