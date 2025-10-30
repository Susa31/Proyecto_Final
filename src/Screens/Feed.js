import React, { useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from 'react-native-paper';

const Feed = ({ navigation }) => {
  //An array of posts,  pagination starting at page 1, max number of posts per page
  const [posts, setPosts] = useState([]); 
  const [page, setPage] = useState(1); 
  const MAX_POSTS_PAGE = 10;

  //Pagination logic here, start and end indexes (Indexes start at 0, keep that in mind)
  const start = (page - 1) * MAX_POSTS_PAGE;
  const end = start + MAX_POSTS_PAGE;
  const visiblePosts = posts.slice(start, end); //To get array of posts for the current page

  //This here renders each post item
  const renderItem = ({ item }) => (
    <Card style={{ margin: 10 }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: 'bold' }}>{item.fullname} @{item.username}</Text>
          <Text style={{ color: 'gray', fontSize: 12 }}>{item.createdAt}</Text>
        </View>
        <Text style={{ marginTop: 5 }}>{item.content}</Text>
      </Card.Content>
    </Card>
  ); //Might add Avatar later

  //This if there are no posts to show, yet...
  const listIfEmpty = (
    <View style={{ padding: 20 }}>
      <Text>Nothing to show here, yet...</Text>
    </View>
  );

  //Post, Previous and Next buttons here
  const listFooter = (
    <>
      <View style={{ padding: 10 }}>
        <Button
          mode="contained"
          buttonColor="#8A2BE2"
          onPress={() =>
            navigation.navigate('PublishPost', {
              onPublish: (newPost) => {
                setPosts(prev => [newPost, ...prev]); //Add Post (It goes to the top)
                setPage(1); //Go to first page
              }
            })
          }
        >
          Post
        </Button>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
        <Button
          disabled={page === 1} //Can't go back from page 1
          onPress={() => setPage(prev => prev - 1)}
        >
          Previous
        </Button>
        <Button
          disabled={end >= posts.length} //Disable if you are at the last page
          onPress={() => setPage(prev => prev + 1)}
        >
          Next
        </Button>
      </View>
    </>
  ); //Note: Should add a Page indicator over here in the footer later <-----
     /////

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 13 }}>
          Your Feed
        </Text>
      </View>

      <FlatList
        data={visiblePosts} //Visible posts only, not all of them
        renderItem={renderItem}
        keyExtractor={item => item.id} //To identify by id
        ListEmptyComponent={listIfEmpty}
        ListFooterComponent={listFooter}
      />
    </SafeAreaView>
  );
};//Closes Feed component

export default Feed;

//No Styles applied, yet...
//Based on FlatList example from React Native docs

//Right now there is a debugger message about passing functions in route params
//But this doesn't affect the app functionality
