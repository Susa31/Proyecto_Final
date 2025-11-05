import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { List, Avatar, Divider, Button, Text } from 'react-native-paper';
import { firestore } from '../config/firebase';

const Search = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const { currentUser } = route.params;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = [];
        const querySnapshot = await firestore().collection('users').get();
        querySnapshot.forEach(doc => {
          // No me muestro a mí mismo en la lista
          if (doc.id !== currentUser.id) { 
            usersList.push({ id: doc.id, ...doc.data() });
          }
        });
        setUsers(usersList);
      } catch (e) {
        console.error("Error al buscar usuarios: ", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser.id]);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        // ¡Pasa los IDs que la pantalla de perfil ahora espera!
        onPress={() => navigation.navigate('ViewProfile', { 
            profileId: item.id, 
            currentUserId: currentUser.id 
        })}
      >
        <List.Item
          title={item.nameFull}
          description={'@' + item.nameUser}
          titleStyle={{fontWeight: 'bold'}}
          left={props =>
            item.avatarUrl ? (
              <Avatar.Image {...props} source={{ uri: item.avatarUrl }} size={48} />
            ) : (
              <Avatar.Text
                {...props}
                label={`${item.nameFull?.[0] || 'U'}`.toUpperCase()}
                size={48}
              />
            )
          }
        />
        <Divider />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator style={{marginTop: 30}} size="large" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No se encontraron usuarios.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  emptyText: {
    textAlign: 'center', 
    marginTop: 20
  }
});

export default Search;