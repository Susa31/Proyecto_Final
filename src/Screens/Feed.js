import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, IconButton, FAB } from 'react-native-paper';
import ZHeader from '../Components/ZHeader';
import { getFeedTweets, toggleRepost } from '../config/firebaseService'; 
import { useIsFocused } from '@react-navigation/native';
import Video from 'react-native-video'; 
import { GlobalStyles } from '../Styles/Styles';

const deduplicateFeedPosts = (posts) => {
    const originalPostIdsInReposts = new Set();
    const repostIds = new Set();

    posts.forEach(item => {
        if (item.isRepost && item.originalPostId) {
            originalPostIdsInReposts.add(item.originalPostId);
            repostIds.add(item.id);
        }
    });

    const finalPosts = posts.filter(item => {
        if (item.isRepost === true) {
            return true;
        }
        
        if (originalPostIdsInReposts.has(item.id)) {
            return false;
        }

        return true;
    });

    return finalPosts;
};

const Feed = ({ navigation, route }) => {
    const { user } = route.params;
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const isFocused = useIsFocused();
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(user.avatarUrl);
    const [page, setPage] = useState(1);
    const MAX_POSTS_PAGE = 10;

    const loadFeed = async () => {
        try {
            const feedPosts = await getFeedTweets(user.id);
            const finalPosts = deduplicateFeedPosts(feedPosts); 
            setPosts(finalPosts || []);
        } catch (error) {
            console.error("Error loading the feed: ", error);
            if (error.code === 'firestore/failed-precondition') {
                Alert.alert("Database Error", "An index is needed. Check the debug console and click the link to create it.");
            } else {
                Alert.alert("Error", "Could not load your feed.");
            }
        }
    };

    useEffect(() => {
        if (isFocused) {
            setLoading(true);
            loadFeed().finally(() => setLoading(false));
        }
    }, [user.id, isFocused]);

    const start = (page - 1) * MAX_POSTS_PAGE;
    const end = start + MAX_POSTS_PAGE;
    const visiblePosts = posts.slice(start, end);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await loadFeed();
        setPage(1);
        setIsRefreshing(false);
    };

    const updatePost = (updatedPost) => {
        setPosts((prevPosts) =>
            prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
        );
    };

    const handleAvatarUpdate = (newUrl) => {
        console.log("Avatar updated in Feed, setting URL:", newUrl);
        setCurrentAvatarUrl(newUrl);
    };

    const handleRepost = (postToToggle) => {
        const originalPostId = postToToggle.isRepost ? postToToggle.originalPostId : postToToggle.id;
        
        if (!originalPostId) {
            Alert.alert("Error", "Could not find original post to repost/undo.");
            return;
        }

        Alert.alert(
            "Confirm Action",
            postToToggle.hasBeenRepostedByMe ? 
                "Do you want to remove this repost?" :
                "Do you want to repost this post?",
            [{ text: "Cancel", style: "cancel" },
            {
                text: postToToggle.hasBeenRepostedByMe ? "Remove" : "Repost",
                onPress: async () => {
                try {
                    const result = await toggleRepost(originalPostId, user.id);
                    
                    if (result.action === 'created') {
                        Alert.alert("Success", "Repost published!");
                    } else {
                        Alert.alert("Success", "Repost removed!");
                    }
                    
                    await loadFeed(); 
                } catch (error) {
                    console.error("Error with repost action: ", error);
                    Alert.alert("Error", "Could not perform repost action. Please try again.");
                }
            }
            }
            ]
        );
    };
    
    const handleNewPostPublished = (newPost) => {
        if (newPost) {
            console.log("New post published! Adding to the feed.");
            setPosts(prevPosts => [newPost, ...prevPosts]);
            setPage(1);
        }
    };

    const goToPublishPost = () => {
        navigation.navigate('PublishPost', {
            user: user,
            onPublish: handleNewPostPublished,
        });
    };

    const renderItem = ({ item }) => {
        if (!item) return null;

        const displayAuthorName = item.isRepost ? item.originalAuthorNameFull : item.authorNameFull;
        const displayAuthorUser = item.isRepost ? item.originalAuthorNameUser : item.authorNameUser;
        
        return (
        <View>
            {item.isRepost && (
                <View style={GlobalStyles.repostContainer}>
                    <IconButton icon="repeat-variant" size={16} color="gray" style={{margin: 0, padding: 0}} />
                    <Text style={GlobalStyles.repostText}>{item.authorNameFull} Reposted</Text>
                </View>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate('ViewPost', { post: item, user: user, updatePost: updatePost })}
            >
              <Card style={item.isRepost ? GlobalStyles.repostCard : GlobalStyles.card}>
                <Card.Content>
                  <View style={GlobalStyles.postHeader}>
                    <Text style={GlobalStyles.postNames}>
                        {displayAuthorName}
                        <Text style={{fontWeight: 'normal', color: 'gray'}}> @{displayAuthorUser}</Text> 
                    </Text>
                    <Text style={GlobalStyles.postDate}>{item.createdAt || '...'}</Text>
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
                      resizeMode="cover"
                      controls={true}
                      paused={true}
                      onError={(e) => console.log("Video Error:", e)}
                    />
                  )}
                  <View style={GlobalStyles.postActions}>
                      <Button
                        icon={item.hasBeenRepostedByMe ? "repeat" : "repeat-variant"} 
                        onPress={() => handleRepost(item)}
                        disabled={item.isRepost && item.authorId !== user.id} 
                        labelStyle={GlobalStyles.actionButtonLabel}
                      >
                        {item.repostCount || 0}
                      </Button>
                      <Button
                        icon={(item.likes || []).includes(user.nameUser) ? 'heart' : 'heart-outline'}
                        onPress={() => navigation.navigate('ViewPost', { post: item, user: user, updatePost: updatePost })}
                        labelStyle={GlobalStyles.actionButtonLabel}
                      >
                        {(item.likes || []).length}
                      </Button>
                      <Button
                        icon="comment-outline"
                        onPress={() => navigation.navigate('ViewPost', { post: item, user: user, updatePost: updatePost })}
                        labelStyle={GlobalStyles.actionButtonLabel}
                      >
                        {(item.comments || []).length}
                      </Button>
                    </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
        </View>
      )};

    const listIfEmpty = (
        <View style={GlobalStyles.emptyContainer}>
            <Text style={GlobalStyles.emptyText}>Nothing to show... follow people or post something!</Text>
        </View>
    );

    const renderPagination = () => (
        <View style={GlobalStyles.paginationContainer}>
            <Button
                mode="outlined"
                disabled={page === 1}
                onPress={() => setPage(prev => prev - 1)}
                theme={{ colors: { outline: "#8A2BE2" } }}
                textColor="#8A2BE2"
            >
                Previous
            </Button>
            <Text style={GlobalStyles.paginationText}>Page {page}</Text>
            <Button
                mode="outlined"
                disabled={end >= posts.length}
                onPress={() => setPage(prev => prev + 1)}
                theme={{ colors: { outline: "#8A2BE2" } }}
                textColor="#8A2BE2"
            >
                Next
            </Button>
        </View>
    );

    return (
        <SafeAreaView style={GlobalStyles.feedContainer}>
            <ZHeader 
                user={user} 
                navigation={navigation}
                avatarUrl={currentAvatarUrl}
                onAvatarUpdate={handleAvatarUpdate}
            />
            {loading ? (
                <ActivityIndicator style={{marginTop: 30}} size="large" />
            ) : (
                <FlatList
                    data={visiblePosts}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item?.id || index.toString()}
                    ListEmptyComponent={listIfEmpty}
                    onRefresh={onRefresh}
                    refreshing={isRefreshing}
                    ListFooterComponent={posts.length > 0 ? renderPagination : null}
                />
            )}
            <FAB
                style={GlobalStyles.fab}
                icon="plus"
                onPress={goToPublishPost}
                color="white"
            />
        </SafeAreaView>
    );
};

export default Feed;