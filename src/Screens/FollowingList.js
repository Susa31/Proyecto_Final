import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { List, Avatar, Divider, Button, Text } from 'react-native-paper';
import { firestore } from '../config/firebase';
import { useIsFocused } from '@react-navigation/native';

const itemsPage = 10;

const FollowingList = ({ route, navigation }) => {
  const { userId, currentUserId } = route.params;
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchFollowing = async () => {
      setLoading(true);
      try {
        const followingList = [];
        const snapshot = await firestore()
          .collection('users')
          .doc(userId)
          .collection('following')
          .get();

        for (const doc of snapshot.docs) {
          const userProfileDoc = await firestore().collection('users').doc(doc.id).get();
          if (userProfileDoc.exists) {
            followingList.push({ id: userProfileDoc.id, ...userProfileDoc.data() });
          }
        }
        
        const sortedUsers = followingList.sort((a, b) =>
          (a.nameFull || '').toLowerCase().localeCompare((b.nameFull || '').toLowerCase())
        );
        setUsers(sortedUsers);
      } catch (error) {
        console.log('Error loading following list', error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
        fetchFollowing();
    }
  }, [userId, isFocused]); 

  const totalPages = Math.ceil(users.length / itemsPage);
  const startIndex = (page - 1) * itemsPage;
  const endIndex = startIndex + itemsPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ViewProfile', { 
            profileId: item.id, 
            currentUserId: currentUserId 
        })}
      >
        <List.Item
          title={item.nameFull}
          description={'@' + (item.nameUser)}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
          style={styles.listItem}
          left={props =>
            item.avatarUrl ? (
              <Avatar.Image {...props} source={{ uri: item.avatarUrl }} size={48} />
            ) : (
              <Avatar.Text
                {...props}
                label={`${item.nameFull?.[0] || ''}`.toUpperCase()}
                size={48}
                style={{ backgroundColor: '#8A2BE2' }}
                color='#FFFFFF'
              />
            )
          }
        />
        <Divider style={styles.divider} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 30 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={paginatedUsers}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            This user is not following anyone yet
          </Text>
        }
      />
      
      <View style={styles.paginationContainer}>
        <Button mode='outlined' disabled={page === 1} onPress={() => setPage(page - 1)}>
          Previous
        </Button>
        <Text style={styles.paginationText}>Page {page} of {totalPages}</Text>
        <Button mode='outlined' disabled={page === totalPages} onPress={() => setPage(page + 1)}>
          Next
        </Button>
      </View>
    </View>
  );
}; 

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', },
  listItem: { padding: 10, },
  listItemTitle: { fontWeight: 'bold', },
  listItemDescription: { fontSize: 12, },
  divider: { height: 1, backgroundColor: '#eee', },
  paginationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderTopWidth: 1, borderColor: '#eee', },
  paginationText: { fontSize: 16, color: '#333', },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#8A2BE2' }
});

export default FollowingList;