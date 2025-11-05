import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { List, Avatar, Divider, Button, Text } from 'react-native-paper';
import styles from '../Styles/screenStyles';

const itemsPage = 10;

const FollowingListScreen = ({ route, navigation }) => {
  let users = [];
  try {
    users = route.params.users;
  } catch (error) {
    console.log('Error loading users');
  }

  const [page, setPage] = useState(1);

  let sortedUsers = [];
  try {
    sortedUsers = [...users].sort((a, b) =>
      a.fullName?.toLowerCase().localeCompare(b.fullName?.toLowerCase())
    );
  } catch (error) {
    console.log('Error sorting users');
  }

  const totalPages = Math.ceil(sortedUsers.length / itemsPage);
  const startIndex = (page - 1) * itemsPage;
  const endIndex = startIndex + itemsPage;

  let paginatedUsers = [];
  try {
    paginatedUsers = sortedUsers.slice(startIndex, endIndex);
  } catch (error) {
    console.log('Error paginating users');
  }

  const renderItem = ({ item }) => {
    try {
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('ViewProfile', { profile1: item })}
        >
          <List.Item
            title={item.fullName}
            description={
              <View>
                <Text>{'@' + item.userName}</Text>
                <Text>{item.description}</Text>
              </View>
            }
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
            style={styles.listItem}
            left={props =>
              item.avatarUrl ? (
                <Avatar.Image {...props} source={{ uri: item.avatarUrl }} size={48} />
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
    } catch (error) {
      console.log('Error rendering user item');
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={paginatedUsers}
        renderItem={renderItem}
        keyExtractor={item => {
          try {
            return item.id.toString();
          } catch (error) {
            console.log('Error extracting key');
            return '0';
          }
        }}
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
          onPress={() => {
            try {
              setPage(page - 1);
            } catch (error) {
              console.log('Error changing to previous page');
            }
          }}
        >
          Previous
        </Button>

        <Text style={styles.paginationText}>
          Page {page} of {totalPages}
        </Text>

        <Button
          mode='outlined'
          disabled={page === totalPages}
          onPress={() => {
            try {
              setPage(page + 1);
            } catch (error) {
              console.log('Error changing to next page');
            }
          }}
        >
          Next
        </Button>
      </View>
    </View>
  );
};

export default FollowingListScreen;