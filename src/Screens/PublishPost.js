import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { Card, TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { publishTweet } from '../config/firebaseService';
import { uploadMediaToCloudinary } from '../config/imageService';
import { launchImageLibrary } from 'react-native-image-picker';
import { GlobalStyles } from '../Styles/Styles';

const PublishPost = ({ navigation, route }) => {
    const [content, setContent] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    
    const [mediaUri, setMediaUri] = useState(null); 
    const [mediaType, setMediaType] = useState(null); 
    
    const { user } = route.params; 

    useEffect(() => {
        const trimmed = content.trim();
        setCharCount(trimmed.length);
        setIsValid((trimmed.length > 0 && trimmed.length <= 280) || (mediaUri != null && trimmed.length <= 280));
    }, [content, mediaUri]);

    const handleSelectMedia = (type) => { 
        launchImageLibrary(
            { 
                mediaType: type, 
                quality: type === 'video' ? 0.5 : 0.7,
            }, 
            (response) => {
                if (response.didCancel) {
                    console.log('User cancelled');
                } else if (response.errorCode) {
                    console.log('ImagePicker Error: ', response.errorMessage);
                } else {
                    const asset = response.assets[0];

                    if (type === 'video' && asset.duration) {
                        console.log(`Selected video duration: ${asset.duration} seconds`);
                        if (asset.duration > 10) {
                            Alert.alert(
                                "Video Too Long",
                                "Please select a video of 10 seconds or less."
                            );
                            return; 
                        }
                    }

                    setMediaUri(asset.uri); 
                    setMediaType(asset.type); 
                }
            }
        );
    };

    const handlePublish = async () => {
        if (!isValid || isLoading || !user) return;
        setIsLoading(true); 
        
        try {
            let mediaUrl = null;
            let postMediaType = null; 
            
            if (mediaUri && mediaType) {
                console.log(`Uploading ${mediaType} to Cloudinary...`);
                mediaUrl = await uploadMediaToCloudinary(mediaUri, mediaType);
                postMediaType = mediaType.startsWith('image') ? 'image' : 'video';
            }

            const newPostData = {
                content: content.trim(), 
                authorId: user.id,
                fullname: user.nameFull, 
                username: user.nameUser,
                mediaUrl: mediaUrl, 
                mediaType: postMediaType, 
            };

            const publishedPost = await publishTweet(newPostData);

            if (route.params?.onPublish) {
                route.params.onPublish({ 
                    ...publishedPost, 
                    text: publishedPost.text, 
                    imageUrl: publishedPost.mediaType === 'image' ? publishedPost.mediaUrl : null,
                    videoUrl: publishedPost.mediaType === 'video' ? publishedPost.mediaUrl : null,
                    createdAt: new Date().toLocaleString() 
                });
            }
            
            Alert.alert(
                'Published',
                'Your post has been shared!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        
        } catch (error) {
            console.error("Error publishing: ", error);
            Alert.alert("Error", "Could not publish your post. Please try again.");
            setIsLoading(false); 
        }
    };

    const clearMedia = () => {
        setMediaUri(null);
        setMediaType(null);
    }

    return (
    <ScrollView style={GlobalStyles.publishContainer}>
        <View style={GlobalStyles.publishInnerContainer}>
        <Card style={GlobalStyles.publishCard}>
            <Card.Content>
            <Text style={GlobalStyles.publishTitle}>
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
            
            {mediaUri && mediaType?.startsWith('image') && (
                <View style={GlobalStyles.mediaPreviewContainer}>
                    <Image source={{ uri: mediaUri }} style={GlobalStyles.mediaPreviewImage} />
                    <TouchableOpacity style={GlobalStyles.mediaRemoveButton} onPress={clearMedia}>
                        <Text style={GlobalStyles.mediaRemoveText}>X</Text>
                    </TouchableOpacity>
                </View>
            )}

            {mediaUri && mediaType?.startsWith('video') && (
                 <View style={GlobalStyles.mediaPreviewContainer}>
                    <Text style={GlobalStyles.mediaPreviewVideoPlaceholder}>Video attached: {mediaUri.split('/').pop()}</Text>
                    <TouchableOpacity style={GlobalStyles.mediaRemoveButton} onPress={clearMedia}>
                        <Text style={GlobalStyles.mediaRemoveText}>X</Text>
                    </TouchableOpacity>
                </View>
            )}
            
            <Text style={GlobalStyles.charCount}>{charCount}/280</Text> 

            <View style={GlobalStyles.mediaButtonRow}>
                <Button
                    mode="outlined"
                    textColor="#8A2BE2"
                    theme={{ colors: { outline: "#8A2BE2" } }}
                    icon="camera"
                    onPress={() => handleSelectMedia('photo')}
                    style={GlobalStyles.mediaButton}
                    disabled={isLoading}
                >
                    Photo
                </Button>
                <Button
                    mode="outlined"
                    textColor="#8A2BE2"
                    theme={{ colors: { outline: "#8A2BE2" } }}
                    icon="video"
                    onPress={() => handleSelectMedia('video')}
                    style={GlobalStyles.mediaButton}
                    disabled={isLoading}
                >
                    Video
                </Button>
            </View>

            <Button
                mode="contained"
                buttonColor="#8A2BE2"
                onPress={handlePublish}
                icon="send" 
                disabled={!isValid || isLoading}
                loading={isLoading} 
                style={{marginTop: 10}} 
            >
                Publish
            </Button>
            </Card.Content>
        </Card>
      </View>
    </ScrollView>
    );
};

export default PublishPost;