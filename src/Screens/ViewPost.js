import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button, TextInput } from 'react-native-paper';
import { firestore } from '../config/firebase'; 
import { updateTweetLikes, addCommentToTweet } from '../config/firebaseService';

const ViewPost = ({ route, navigation }) => {
    const { post, user, updatePost } = route.params; 
    const [ currentPost, setCurrentPost ] = useState(post);
    const [ newComment, setNewComment ] = useState('');

    const [ isCommentValid, setIsCommentValid ] = useState(false);
    const [ commentCharCount, setCommentCharCount ] = useState(0);

    useEffect(() => {
        setCurrentPost(post);
    }, [post]);

    useEffect(() => {
        const trimmed = newComment.trim();
        setCommentCharCount(newComment.length);
        setIsCommentValid(trimmed.length > 0 && newComment.length <= 280);
    }, [newComment]);

    const handleLike = () => {
        const userHasLiked = (currentPost.likes || []).includes(user.nameUser); 
        let updatedLikes;
        
        if (userHasLiked) {
            updatedLikes = (currentPost.likes || []).filter(u => u !== user.nameUser);
        } else {
            updatedLikes = [...(currentPost.likes || []), user.nameUser];
        }
        
        const updated = {
            ...currentPost,
            likes: updatedLikes,
        };
        setCurrentPost(updated);
        updatePost(updated);
        
        updateTweetLikes(currentPost.id, updatedLikes)
            .catch(err => {
                console.error("Error when saving the Like: ", err);
            });
    };

    const handleAddComment = () => {
        if (!isCommentValid) {
            Alert.alert("Invalid Comment", "Your comment cannot be empty and must be under 280 characters.");
            return;
        }

        const trimmed = newComment.trim();
        
        const comment = {
            id: Date.now().toString(),
            fullname: user.nameFull, 
            username: user.nameUser, 
            authorId: user.id,
            text: trimmed,
            createdAt: new Date(), 
        };

        const localComment = {
            ...comment,
            createdAt: comment.createdAt.toLocaleString(),
        };

        const updated = {
            ...currentPost,
            comments: [localComment, ...(currentPost.comments || [])],
        };
        
        setCurrentPost(updated);
        updatePost(updated);
        setNewComment('');
        
        addCommentToTweet(currentPost.id, comment)
            .catch(err => {
                console.error("Error when saving the comment: ", err);
            });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.innerContainer}>
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.postHeader}>
                            <TouchableOpacity onPress={() => {
                                navigation.navigate('ViewProfile', { 
                                    profileId: currentPost.authorId,
                                    currentUserId: user.id
                                });
                            }}>
                                <Text style={styles.postNames}>{currentPost.authorNameFull} @{currentPost.authorNameUser}</Text>
                            </TouchableOpacity>
                            <Text style={styles.postDate}>{currentPost.createdAt}</Text>
                        </View>

                        <Text style={styles.postContent}>{currentPost.text}</Text>

                        <View style={styles.postActions}>
                            <Button
                                mode="contained"
                                buttonColor="#8A2BE2"
                                onPress={handleLike}
                                icon={(currentPost.likes || []).includes(user.nameUser) ? 'heart' : 'heart-outline'}
                            >
                                {(currentPost.likes || []).length} Likes
                            </Button>

                            <Button mode="outlined">
                                {(currentPost.comments || []).length} Comments
                            </Button>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.commentTitle}>Add a comment</Text>
                        <TextInput
                            label="Comment something!"
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                            mode="outlined"
                            maxLength={280} 
                            style={{ marginBottom: 10 }}
                        />
                        
                        <Text style={styles.charCount}>
                            {commentCharCount}/280
                        </Text>
                        
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

                <View style={styles.commentsList}>
                    <Text style={styles.commentTitle}>
                        Comments ({(currentPost.comments || []).length})
                    </Text>
                    {(currentPost.comments || []).map((comment) => (
                        <Card key={comment.id} style={styles.commentCard}>
                            <Card.Content>
                                <View style={styles.postHeader}>
                                    <TouchableOpacity onPress={() => {
                                        navigation.navigate('ViewProfile', { 
                                            profileId: comment.authorId,
                                            currentUserId: user.id
                                        });
                                    }}>
                                        <Text style={styles.commentAuthor}>{comment.fullname} @{comment.username}</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.commentDate}>
                                        {comment.createdAt?.toString() || ''}
                                    </Text>
                                </View>
                                <Text style={styles.commentText}>{comment.text}</Text>
                            </Card.Content>
                        </Card>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};//Closes ViewPost

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    innerContainer: {
        padding: 16,
    },
    card: {
        marginBottom: 15,
        elevation: 1,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    postNames: {
        fontWeight: 'bold',
        fontSize: 16
    },
    postDate: {
        color: 'gray',
        fontSize: 12
    },
    postContent: {
        marginTop: 10,
        fontSize: 18, 
        lineHeight: 26,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    commentTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
    },
    charCount: {
        textAlign: 'right',
        marginBottom: 5,
        color: 'gray'
    },
    commentsList: {
        marginTop: 20,
    },
    commentCard: {
        marginBottom: 8,
        backgroundColor: '#fff'
    },
    commentAuthor: {
        fontWeight: 'bold'
    },
    commentDate: {
        color: 'gray',
        fontSize: 11
    },
    commentText: {
        marginTop: 4
    }
});//Closes styles

export default ViewPost;

//Styles might change later
