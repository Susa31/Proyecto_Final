import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Card, TextInput, Button, Text } from 'react-native-paper';
import { firestore } from '../config/firebase';
import { publishTweet } from '../config/firebaseService';

const PublishPost = ({ navigation, route }) => {
    const [content, setContent] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = route.params; 

    //Validation here
    useEffect(() => {
        const trimmed = content.trim();
        setCharCount(trimmed.length);
        setIsValid(trimmed.length > 0 && trimmed.length <= 280);
    }, [content]);

    //The Button is disabled if the post is invalid, but this is for double safety
    const handlePublish = async () => {
        if (!isValid || isLoading) return;
        setIsLoading(true); 
        
        const newPostData = {
            text: content.trim(), 
            authorId: user.uid, 
            authorNameFull: user.nameFull,
            authorNameUser: user.nameUser,
            createdAdd: firestore.FieldValue.serverTimestamp(),
            likes: [],
            comments: []
        };

        try {
            const publishedPost = await publishTweet(newPostData);

            if (route.params?.onPublish) {
                route.params.onPublish({ 
                    ...publishedPost, 
                    content: publishedPost.text, 
                    createdAt: new Date().toLocaleString() 
                });
            }
            
            Alert.alert(
                'Published',
                'Your Post has been published!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        
        } catch (error) {
            console.error("Error while Publishing: ", error);
            Alert.alert("Error", "Could not publish your Post, give it another try later.");
            setIsLoading(false); 
        }
    };

    return (
    <ScrollView>
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Card>
            <Card.Content>
            <TextInput
                label="What do you have in mind?"
                value={content}
                onChangeText={setContent}
                multiline
                mode="outlined"
                maxLength={280}
                style={{ marginBottom: 10 }}
            />
            <Text style={{ textAlign: 'right' }}>{charCount}/280</Text> 

            <Button
                mode="contained"
                buttonColor="#8A2BE2"
                onPress={handlePublish}
                icon="send" //Maybe change icon later
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

export default PublishPost;

//Styles could change later