import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { List, Avatar, Divider, Button, Text } from 'react-native-paper';
import styles from '../styles/screenStyles';

const itemsPage = 10;

const FollowingListScreen = ({ route, navigation }) => {
  const { users } = route.params;
  const [page, setPage] = useState(1);

  const sortedUsers = [...users].sort((a, b) =>
    a.fullName?.toLowerCase().localeCompare(b.fullName?.toLowerCase())
  );

  const totalPages = Math.ceil(sortedUsers.length / itemsPage);
  const startIndex = (page - 1) * itemsPage;
  const endIndex = startIndex + itemsPage;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ViewProfile', { profile1: item })}
    >
      <List.Item
        title={item.fullName}
        description={item.userName}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
        style={styles.listItem}
        left={props =>
          item.avatarUrl ? (
            <Avatar.Image {...props} source={{ uri: item.avatarUrl }} />
          ) : (
            <Avatar.Text
              {...props}
              label={`${item.fullName?.[0] || ''}`.toUpperCase()}
              size={48}
              style={{ backgroundColor: '#7C4DFF' }}
              color='#FFFFFF'
            />
          )
        }
      />
      <Divider style={styles.divider} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={paginatedUsers}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#4A148C' }}>
            There are no users to show
          </Text>
        }
      />

      <View style={styles.paginationContainer}>
        <Button
          mode='outlined'
          disabled={page === 1}
          onPress={() => setPage(page - 1)}
        >
          Previous
        </Button>

        <Text style={styles.paginationText}>
          Page {page} of {totalPages}
        </Text>

        <Button
          mode='outlined'
          disabled={page === totalPages}
          onPress={() => setPage(page + 1)}
        >
          Next
        </Button>
      </View>
    </View>
  );
};

export default FollowingListScreen;
