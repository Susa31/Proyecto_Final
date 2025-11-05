import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, TextInput } from 'react-native-paper';

const ViewPost = ({ route }) => {
    const { post, username, updatePost } = route.params;
    const [ currentPost, setCurrentPost ] = useState(post); //State for the post being viewed
    const [ newComment, setNewComment ] = useState('');

    //States for comment validation
    const [ isCommentValid, setIsCommentValid ] = useState(false);
    const [ commentCharCount, setCommentCharCount ] = useState(0);

    //Validation based on PublishPost post validation
    useEffect(() => {
        const trimmed = newComment.trim();
        setCommentCharCount(newComment.length);
        setIsCommentValid(trimmed.length > 0 && newComment.length <= 280);
    }, [newComment]);

    //Logic for liking, works as a toggle to like and unlike
    const handleLike = () => {
        const userHasLiked = currentPost.likes.includes(username); 
        let updatedLikes;
        
        if (userHasLiked) {
            updatedLikes = currentPost.likes.filter(user => user !== username);
        } else {
            updatedLikes = [...currentPost.likes, username];
        }
        
        const updated = {
            ...currentPost,
            likes: updatedLikes,
        };
        setCurrentPost(updated);
        updatePost(updated);
    };

    //Logic for adding a comment
    //Double security like in PublishPost
    const handleAddComment = () => {
        if (!isCommentValid) {
            Alert.alert("Invalid Comment", "Your comment cannot be empty and must be under 280 characters.");
            return;
        }

        const trimmed = newComment.trim();
        const comment = {
            id: Date.now().toString(),
            fullname: 'FullName', 
            username,
            text: trimmed,
            createdAt: new Date().toLocaleString(),
        };

        const updated = {
            ...currentPost,
            comments: [comment, ...currentPost.comments],
        };
        //Updates for feed to update as well
        setCurrentPost(updated);
        updatePost(updated);
        setNewComment('');
    };

    return (
        <ScrollView>
            <View style={{ padding: 16 }}>
                <Card style={{ marginBottom: 15 }}>
                    <Card.Content>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontWeight: 'bold' }}>
                                {currentPost.fullname} @{currentPost.username}
                            </Text>
                            <Text style={{ color: 'gray', fontSize: 12 }}>{currentPost.createdAt}</Text>
                        </View>

                        <Text style={{ marginTop: 10, fontSize: 16 }}>{currentPost.content}</Text>

                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 15,
                            }}
                        >
                            <Button
                                mode="contained"
                                buttonColor="#8A2BE2"
                                onPress={handleLike}
                            >
                                {currentPost.likes.length} Likes
                            </Button>

                            <Button mode="outlined">
                                {currentPost.comments.length} Comments
                            </Button>
                        </View>
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Content>
                        <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Add a comment</Text>
                        <TextInput
                            label="Comment something!"
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                            mode="outlined"
                            maxLength={280} 
                            style={{ marginBottom: 10 }}
                        />
                        
                        <Text style={{ textAlign: 'right', marginBottom: 5 }}>
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

                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
                        Comments ({currentPost.comments.length})
                    </Text>
                    {currentPost.comments.map((comment) => (
                        <Card key={comment.id} style={{ marginBottom: 8 }}>
                            <Card.Content>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Text style={{ fontWeight: 'bold' }}>
                                        {comment.fullname} @{comment.username}
                                    </Text>
                                    <Text style={{ color: 'gray', fontSize: 11 }}>
                                        {comment.createdAt}
                                    </Text>
                                </View>
                                <Text style={{ marginTop: 4 }}>{comment.text}</Text>
                            </Card.Content>
                        </Card>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};//Closes ViewPost component

export default ViewPost;
//Styles not applied, yet...
