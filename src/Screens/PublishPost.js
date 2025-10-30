import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Card, TextInput, Button, Text } from 'react-native-paper';

const PublishPost = ({ navigation, route }) => {
    const [content, setContent] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const {username} = route.params;

    //Validation here, max of 280 characters and not empty for content
    useEffect(() => {
        const trimmed = content.trim();
        setCharCount(trimmed.length);
        setIsValid(trimmed.length > 0 && trimmed.length <= 280);
    }, [content]);

    //Handling Publish button press
    const handlePublish = () => {
    //The Button is disabled if the post is invalid, but this is for double safety
    if (!isValid) {
        Alert.alert(
        'Invalid',
        'Your post cannot be empty and must be under 280 characters'
        );
        return;
    }

    const newPost = {
        id: Date.now().toString(), //Simple id with timestamp
        content,
        fullname: 'Full Name', //Replace with actual user data later <--
        username,
        createdAt: new Date().toLocaleString() //Use ServerTimestamp later <--
    };

    if (route.params?.onPublish) {
        route.params.onPublish(newPost);
        Alert.alert(
        'Published',
        'Your post has been successfully shared!',
        [{text: 'OK',
        onPress: () => { //Navigation inside onPress to show the alert before changing the screen
                    setContent('');
                    navigation.goBack();}
        }
        ])
    }
    /*//In case of not using the alert
      navigation.goBack(); 
      setContent('');
       */
    };

    return (
    <ScrollView>
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Card>
             <Card.Content>
            <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 15 }}>
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
            
            <Text style={{ textAlign: 'right' }}>{charCount}/280</Text> 

            <Button
                mode="contained"
                buttonColor="#8A2BE2"
                onPress={handlePublish}
                icon="send" //Maybe change icon later
                disabled={!isValid}
            >
            Publish
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
    );
}; //Closes PublishPost Component

export default PublishPost;

//No Styles applied, yet...
