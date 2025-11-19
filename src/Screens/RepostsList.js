import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, Image, Text } from 'react-native';
import { List, Avatar, Divider, Button, IconButton, Card } from 'react-native-paper';
import { getRepostsForProfile } from '../config/firebaseService'; 
import { useIsFocused } from '@react-navigation/native';
import Video from 'react-native-video'; 
import { GlobalStyles } from '../Styles/Styles';

const PostCard = ({ item, user, navigation }) => (
    <View> 
        <View style={GlobalStyles.repostContainer}>
            <IconButton icon="repeat-variant" size={16} color="gray" style={{margin: 0, padding: 0}} />
            <Text style={GlobalStyles.repostText}>{item.authorNameFull} Reposted</Text>
        </View>
        
        <TouchableOpacity
          onPress={() => navigation.navigate('ViewPost', { 
              post: item, 
              user: user, 
            })}
        >
          <Card style={GlobalStyles.repostCard}>
            <Card.Content>
              <View style={GlobalStyles.postHeader}>
                <Text style={GlobalStyles.postNames}>
                    {item.originalAuthorNameFull} 
                    <Text style={{fontWeight: 'normal', color: 'gray'}}> @{item.originalAuthorNameUser}</Text>
                </Text>
                <Text style={GlobalStyles.postDate}>{item.createdAt}</Text>
              </View>
              {item.text ? (<Text style={GlobalStyles.postContent}>{item.text}</Text>) : null}
              {item.mediaType === 'image' && item.mediaUrl && (
                <Image 
                    source={{ uri: item.mediaUrl }} 
                    style={GlobalStyles.postImage} 
                    resizeMode="cover"
                />
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

const RepostsList = ({ route, navigation }) => {
    const { userId, currentUser } = route.params;
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const isFocused = useIsFocused(); 

    useEffect(() => {
        const fetchReposts = async () => {
            setLoading(true);
            try {
                const reposts = await getRepostsForProfile(userId);
                setPosts(reposts);
            } catch (error) {
                console.log('Error loading reposts list', error);
            } finally {
                setLoading(false);
            }
        };

        if (isFocused) {
            fetchReposts();
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
        return <ActivityIndicator style={{ marginTop: 30 }} size="large" />;
    }

    return (
        <View style={GlobalStyles.whiteContainer}>
            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={
                    <Text style={GlobalStyles.emptyTextGeneral}>
                        This user has not reposted anything yet.
                    </Text>
                }
            />
        </View>
    );
}; 

export default RepostsList;