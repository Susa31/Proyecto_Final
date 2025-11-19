import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { Card, Text, Button, TextInput, IconButton } from 'react-native-paper';
import { firestore } from '../config/firebase'; 
import { updateTweetLikes, addCommentToTweet, toggleRepost } from '../config/firebaseService';
import Video from 'react-native-video';
import { GlobalStyles } from '../Styles/Styles';

const ViewPost = ({ route, navigation }) => {
    const { post, user } = route.params || {}; 
    
    console.log('ViewPost route.params:', route.params);
    console.log('Post data:', post);
    console.log('User data:', user);

    if (!post || !user) {
        return (
            <View style={GlobalStyles.feedContainer}>
                <Text style={GlobalStyles.errorText}>Error loading post</Text>
                <Button onPress={() => navigation.goBack()}>Go Back</Button>
            </View>
        );
    }
    
    const postContentId = post.isRepost ? post.originalPostId : post.id;
    
    const [ currentPost, setCurrentPost ] = useState(post);
    const [ newComment, setNewComment ] = useState('');
    const [ isCommentValid, setIsCommentValid ] = useState(false);
    const [ commentCharCount, setCommentCharCount ] = useState(0);
    const [ isRepostedByMe, setIsRepostedByMe ] = useState(false); 

    useEffect(() => {
        if (!postContentId) return; 

        const unsubscribe = firestore()
            .collection('Tweets')
            .doc(postContentId) 
            .onSnapshot(
                (doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        
                        const formattedComments = (data.comments || []).map(comment => ({
                            ...comment,
                            createdAt: comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : (comment.createdAt || '')
                        }));
                        
                        setCurrentPost(prevPost => {
                            const freshContentData = {
                                originalPostId: postContentId, 
                                authorId: data.authorId,
                                text: data.text,
                                mediaUrl: data.mediaUrl,
                                mediaType: data.mediaType,
                                comments: formattedComments,
                                likes: data.likes || [],
                                repostCount: data.repostCount || 0,
                                authorNameFull: data.authorNameFull,
                                authorNameUser: data.authorNameUser,
                                isRepost: false,
                            };
                            
                            if (prevPost.isRepost) {
                                return {
                                    ...prevPost, 
                                    ...freshContentData, 
                                    id: prevPost.id, 
                                    createdAt: prevPost.createdAt,
                                };
                            }
                            
                            return { ...prevPost, ...freshContentData, id: prevPost.id };
                        });
                    }
                },
                (error) => {
                    console.error("Error listening to post:", error);
                }
            );
        return () => unsubscribe();
    }, [postContentId]); 

    useEffect(() => {
        if (!postContentId || !user?.id) return;
        
        const repostQuery = firestore()
            .collection('Tweets')
            .where('originalPostId', '==', postContentId)
            .where('authorId', '==', user.id)
            .limit(1);

        const unsubscribeCheck = repostQuery.onSnapshot(
            (snapshot) => {
                setIsRepostedByMe(!snapshot.empty);
            },
            (error) => {
                console.error("Error checking repost status:", error);
            }
        );
        
        return () => unsubscribeCheck();
    }, [postContentId, user?.id]);

    useEffect(() => {
        const trimmed = newComment.trim();
        setCommentCharCount(newComment.length);
        setIsCommentValid(trimmed.length > 0 && trimmed.length <= 280);
    }, [newComment]);

    const handleLike = () => {
        const targetId = currentPost.originalPostId || currentPost.id;
        
        const userHasLiked = (currentPost.likes || []).includes(user.nameUser); 
        let updatedLikes;
        if (userHasLiked) {
            updatedLikes = (currentPost.likes || []).filter(u => u !== user.nameUser);
        } else {
            updatedLikes = [...(currentPost.likes || []), user.nameUser];
        }
        
        updateTweetLikes(targetId, updatedLikes).catch(err => console.error("Failed to save like: ", err));
    };

    const handleAddComment = () => {
        if (!isCommentValid) return;
        
        const targetId = currentPost.originalPostId || currentPost.id;
        
        const comment = {
            id: Date.now().toString(),
            fullname: user.nameFull, 
            username: user.nameUser, 
            authorId: user.id,
            text: newComment.trim(),
            createdAt: new Date(), 
        };
        addCommentToTweet(targetId, comment).catch(err => console.error("Failed to save comment: ", err));
        setNewComment('');
    };

    const handleRepost = () => {
        const originalPostId = currentPost.originalPostId || currentPost.id;
        
        if (!originalPostId) {
            Alert.alert("Error", "Could not find post reference.");
            return;
        }

        Alert.alert(
            "Confirm Action",
            isRepostedByMe ? 
                "Do you want to remove this repost?" : 
                "Do you want to repost this post?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: isRepostedByMe ? "Remove" : "Repost", 
                    onPress: async () => {
                        try {
                            const result = await toggleRepost(originalPostId, user.id);
                            
                            if (result.action === 'created') {
                                Alert.alert("Success!", "Your repost has been published.");
                            } else {
                                Alert.alert("Success!", "Your repost has been removed.");
                            }
                            
                            navigation.goBack(); 
                        } catch (error) {
                            console.error("Error with repost action: ", error);
                            Alert.alert("Error", "Could not perform the repost action.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={GlobalStyles.feedContainer}>
            <View style={GlobalStyles.viewPostInnerContainer}>
                {currentPost.isRepost && (
                    <View style={GlobalStyles.repostContainer}>
                        <IconButton icon="repeat-variant" size={16} color="gray" style={{margin: 0, padding: 0}} />
                        <Text style={GlobalStyles.repostText}>{currentPost.authorNameFull} Reposted</Text>
                    </View>
                )}

                <Card style={currentPost.isRepost ? GlobalStyles.repostCard : GlobalStyles.card}>
                    <Card.Content>
                        <View style={GlobalStyles.postHeader}>
                            <TouchableOpacity onPress={() => {
                                const authorId = currentPost.originalAuthorId || currentPost.authorId;
                                if (authorId) {
                                    navigation.navigate('ViewProfile', { 
                                        profileId: authorId,
                                        currentUserId: user.id,
                                        currentUser: user
                                    });
                                }
                            }}>
                                <Text style={GlobalStyles.postNames}>
                                    {currentPost.originalAuthorNameFull || currentPost.authorNameFull} 
                                    <Text style={{fontWeight: 'normal', color: 'gray'}}> @{currentPost.originalAuthorNameUser || currentPost.authorNameUser}</Text>
                                </Text>
                                <Text style={GlobalStyles.postDate}>{currentPost.createdAt}</Text>
                            </TouchableOpacity>
                        </View>

                        {currentPost.text ? (<Text style={GlobalStyles.postContentDetail}>{currentPost.text}</Text>) : null}
                        
                        {currentPost.mediaType === 'image' && currentPost.mediaUrl && (
                            <Image 
                                source={{ uri: currentPost.mediaUrl }} 
                                style={GlobalStyles.postImageDetail} 
                                resizeMode="cover"
                            />
                        )}

                        {currentPost.mediaType === 'video' && currentPost.mediaUrl && (
                            <Video
                                source={{ uri: currentPost.mediaUrl }}
                                style={GlobalStyles.postImageDetail} 
                                resizeMode="contain"
                                controls={true}
                                paused={false}
                            />
                        )}

                        <View style={GlobalStyles.viewPostActions}>
                            <Button
                                icon={isRepostedByMe ? "repeat" : "repeat-variant"}
                                onPress={handleRepost}
                                disabled={!postContentId} 
                            >
                                {currentPost.repostCount || 0}
                            </Button>
                            
                            <Button
                                mode="contained"
                                buttonColor="#8A2BE2"
                                onPress={handleLike}
                                icon={(currentPost.likes || []).includes(user.nameUser) ? 'heart' : 'heart-outline'}
                            >
                                {(currentPost.likes || []).length}
                            </Button>
                            
                            <Text style={GlobalStyles.actionButtonLabel}>
                                {(currentPost.comments || []).length} Comments
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={GlobalStyles.card}>
                    <Card.Content>
                        <Text style={GlobalStyles.commentTitle}>Add a comment</Text>
                        <TextInput
                            label="Comment something!"
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                            mode="outlined"
                            maxLength={280} 
                            style={{ marginBottom: 10 }}
                        />
                        <Text style={GlobalStyles.charCount}>{commentCharCount}/280</Text>
                        <Button
                            mode="contained"
                            buttonColor="#8A2BE2"
                            onPress={handleAddComment}
                            disabled={!isCommentValid} 
                        >
                            Comment
                        </Button>
                    </Card.Content>
                </Card>

                <View style={GlobalStyles.commentsList}>
                    <Text style={GlobalStyles.commentTitle}>
                        Comments ({(currentPost.comments || []).length})
                    </Text>
                    {(currentPost.comments || []).slice().reverse().map((comment) => (
                        <Card key={comment.id} style={GlobalStyles.commentCard}>
                            <Card.Content>
                                <View style={GlobalStyles.postHeader}>
                                    <TouchableOpacity onPress={() => {
                                        navigation.navigate('ViewProfile', { 
                                            profileId: comment.authorId,
                                            currentUserId: user.id,
                                            currentUser: user
                                        });
                                    }}>
                                        <Text style={GlobalStyles.commentAuthor}>
                                            {comment.fullname} <Text style={{fontWeight: 'normal', color: 'gray'}}>@{comment.username}</Text>
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={GlobalStyles.commentDate}>
                                        {comment.createdAt?.toString() || ''}
                                    </Text>
                                </View>
                                <Text style={GlobalStyles.commentText}>{comment.text}</Text>
                            </Card.Content>
                        </Card>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

export default ViewPost;