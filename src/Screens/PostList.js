import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, Image, Text } from 'react-native';
import { IconButton, Card, ActivityIndicator as PaperActivityIndicator } from 'react-native-paper';
import { getOriginalPostsForProfile } from '../config/firebaseService'; 
import { useIsFocused } from '@react-navigation/native';
import Video from 'react-native-video'; 
import { GlobalStyles } from '../Styles/Styles';

const PostCard = ({ item, user, navigation }) => (
    <View> 
        <TouchableOpacity
          onPress={() => navigation.navigate('ViewPost', { 
              post: item, 
              user: user, 
            })}
        >
          <Card style={GlobalStyles.card}>
            <Card.Content>
              <View style={GlobalStyles.postHeader}>
                <Text style={GlobalStyles.postNames}>
                    {item.authorNameFull} 
                    <Text style={{fontWeight: 'normal', color: 'gray'}}> @{item.authorNameUser}</Text>
                </Text>
                <Text style={GlobalStyles.postDate}>{item.createdAt}</Text>
              </View>
              {item.text ? (<Text style={GlobalStyles.postContent}>{item.text}</Text>) : null}
              {item.mediaType === 'image' && item.mediaUrl && (
                <Image source={{ uri: item.mediaUrl }} style={GlobalStyles.postImage} resizeMode="cover" />
              )}
              {item.mediaType === 'video' && item.mediaUrl && (
                  <Video
                      source={{ uri: item.mediaUrl }}
                      style={GlobalStyles.postVideo} 
                      resizeMode="contain" 
                      controls={true}      
                      paused={true}        
                  />
              )}
              <View style={GlobalStyles.postActionsText}>
                  <Text style={GlobalStyles.actionText}> {(item.likes || []).length} Likes</Text>
                  <Text style={GlobalStyles.actionText}> {(item.comments || []).length} Comments</Text>
                  <Text style={GlobalStyles.actionText}> {(item.repostCount || 0)} Reposts</Text>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
    </View>
);

const PostsList = ({ route, navigation }) => {
    const { userId, currentUser } = route.params; 
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const isFocused = useIsFocused(); 

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const originalPosts = await getOriginalPostsForProfile(userId);
                setPosts(originalPosts);
            } catch (error) {
                console.log('Error loading original posts', error);
            } finally {
                setLoading(false);
            }
        };

        if (isFocused) {
            fetchPosts();
        }
    }, [userId, isFocused]);

    const renderItem = ({ item }) => {
        return (
            <PostCard 
                item={item} 
                user={currentUser} 
                navigation={navigation} 
            />
        );
    };

    if (loading) {
        return <PaperActivityIndicator style={{ marginTop: 30 }} size="large" />;
    }

    return (
        <View style={GlobalStyles.whiteContainer}>
            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={
                    <Text style={GlobalStyles.emptyTextGeneral}>
                        This user has no original posts yet.
                    </Text>
                }
            />
        </View>
    );
}; 

export default PostsList;