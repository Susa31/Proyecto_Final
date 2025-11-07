import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from 'react-native-paper';
import ZHeader from '../Components/ZHeader'; 
import { getFeedTweets } from '../config/firebaseService';

const Feed = ({ navigation, route }) => {
  const { user } = route.params; 
  const [posts, setPosts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); 
  const MAX_POSTS_PAGE = 10;
  const [currentUserAvatar, setCurrentUserAvatar] = useState(user.avatarUrl);
  const onAvatarUpdate = (newAvatarUrl) => {
    setCurrentUserAvatar(newAvatarUrl);
  };

  useEffect(() => {
    const loadFeed = async () => {
        setLoading(true);
        try {
            console.log("Re-loading feed via focus event for user:", user.id);
            const feedPosts = await getFeedTweets(user.id); 
            setPosts(feedPosts); 
        } catch (error) {
            console.error("Error when loading Feed: ", error);
            if (error.code === 'firestore/failed-precondition') {
                Alert.alert(
                    "Database Error", 
                    "Your app requires a database index. Please check the debug console for more info"
                );
              } else {
                Alert.alert("Error", "Could not load your Feed");
              }
          } finally {
            setLoading(false);
        }
    };

    loadFeed();

    const unsubscribe = navigation.addListener('focus', loadFeed);

    return unsubscribe; 
  }, [user.id, navigation]);
  
  const start = (page - 1) * MAX_POSTS_PAGE;
  const end = start + MAX_POSTS_PAGE;
  const visiblePosts = posts.slice(start, end); 

  const updatePost = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ViewPost', { post: item, user: user, updatePost })}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.postHeader}>
            <Text style={styles.postNames}>{item.authorNameFull} @{item.authorNameUser}</Text>
            <Text style={styles.postDate}>{item.createdAt}</Text>
          </View>
          <Text style={styles.postContent}>{item.text}</Text>
          {item.imageUrl && (
            <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.postImage} 
                resizeMode="cover"
            />
          )} 
          <View style={styles.postActions}>
              <Text style={styles.actionText}> {(item.likes || []).length} Likes</Text>
              <Text style={styles.actionText}> {(item.comments || []).length} Comments</Text>
            </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  ); 

  const listIfEmpty = (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nothing to show, yet... Follow someone or publish something!</Text>
    </View>
  );

  const listFooter = (
    <>
      <View style={styles.footerButtonContainer}>
        <Button
          mode="contained"
          buttonColor="#8A2BE2"
          onPress={() =>
            navigation.navigate('PublishPost', {
              user: user, 
              onPublish: (newPost) => {
                setPosts(prev => [newPost, ...prev]);
                setPage(1);
              }
            })
          }
        >
          Post
        </Button>
      </View>

      <View style={styles.paginationContainer}>
        <Button
          disabled={page === 1}
          onPress={() => setPage(prev => prev - 1)}
        >
          Previous
        </Button>
        <Text style={styles.paginationText}>Page {page}</Text>
        <Button
          disabled={end >= posts.length}
          onPress={() => setPage(prev => prev + 1)}
        >
          Next
        </Button>
      </View>
    </>
  ); 

  return (
    <SafeAreaView style={styles.container}>
      <ZHeader 
        user={user} 
        navigation={navigation} 
        avatarUrl={currentUserAvatar}
        onAvatarUpdate={onAvatarUpdate} 
      />
      {loading ? (
        <ActivityIndicator style={{marginTop: 30}} size="large" />
      ) : (
        <FlatList
          data={visiblePosts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={listIfEmpty}
          ListFooterComponent={listFooter}
        />
      )}
    </SafeAreaView>
  );
};//Closes Feed

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5'
    },
    card: {
        marginVertical: 8,
        marginHorizontal: 10,
        elevation: 1,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    postNames: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    postDate: {
        color: 'gray',
        fontSize: 12,
        alignSelf: 'center'
    },
    postContent: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
    },
    postImage: {
        width: '100%',
        height: 250,
        borderRadius: 8,
        marginTop: 5,
    },
    postActions: {
        flexDirection: 'row',
        marginTop: 12,
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    actionText: {
        color: '#555'
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: 'gray'
    },
    footerButtonContainer: {
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#eee',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        alignItems: 'center'
    },
    paginationText: {
        fontSize: 16,
        color: '#333'
    }
});//Closes styles

export default Feed;

//Styles might change later