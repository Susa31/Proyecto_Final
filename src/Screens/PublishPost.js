import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet, Image, TouchableOpacity } from 'react-native'; 
import { Card, TextInput, Button, Text } from 'react-native-paper';
import { publishTweet } from '../config/firebaseService';
import { uploadImageToCloudinary } from '../config/imageService'; 
import { launchImageLibrary } from 'react-native-image-picker'; 

const PublishPost = ({ navigation, route }) => {
    const [content, setContent] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    
    const [imageUri, setImageUri] = useState(null);
    
    const { user } = route.params; 

    useEffect(() => {
        const trimmed = content.trim();
        setCharCount(trimmed.length);
        setIsValid((trimmed.length > 0 && trimmed.length <= 280) || (imageUri != null && trimmed.length <= 280));
    }, [content, imageUri]);

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

    const handlePublish = async () => {
        if (!isValid || isLoading || !user) {
            Alert.alert("Error", "Can not publish this Post");
            return;
        }
        
        setIsLoading(true); 
        
        try {
            let imageUrl = null;
            
            if (imageUri) {
                console.log("Uploading Post image to Cloudinary...");
                imageUrl = await uploadImageToCloudinary(imageUri);
            }

            const newPostData = {
                content: content.trim(), 
                authorId: user.id,
                fullname: user.nameFull, 
                username: user.nameUser,
                imageUrl: imageUrl,
            };

            const publishedPost = await publishTweet(newPostData);

            if (route.params?.onPublish) {
                route.params.onPublish({ 
                    ...publishedPost, 
                    text: publishedPost.text, 
                    imageUrl: publishedPost.imageUrl, 
                    createdAt: new Date().toLocaleString() 
                });
            }
            
            Alert.alert(
                'Published',
                'Your Post has been shared with others!',
                [{ text: 'OK', onPress: () => navigation.replace('Feed', { user: user }) }]
            );
        
        } catch (error) {
            console.error("Error when publishing: ", error);
            Alert.alert("Error", "Could not Publish your Post. Try again later");
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
            
            {imageUri && (
                <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    <TouchableOpacity 
                        style={styles.removeImageButton} 
                        onPress={() => setImageUri(null)}
                    >
                        <Text style={styles.removeImageText}>X</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Text style={styles.charCount}>{charCount}/280</Text> 

            <Button
                mode="outlined"
                icon="camera"
                buttonColor="#8A2BE2"
                onPress={handleSelectImage}
                style={{ marginBottom: 10 }}
                disabled={isLoading}
            >
                {imageUri ? "Change photo" : "Attach photo"}
            </Button>

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
    },
    imagePreviewContainer: {
        position: 'relative', 
        marginVertical: 10,
    },
    imagePreview: {
        width: '100%',
        height: 200, 
        borderRadius: 8,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});//Closes styles

export default PublishPost;

