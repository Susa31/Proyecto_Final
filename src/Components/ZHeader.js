import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebase'; 
import { Appbar, Avatar } from 'react-native-paper'; 

const ZHeader = ({ user, navigation }) => {

  const handleLogout = async () => {
    try {
      await auth().signOut(); 
      navigation.replace('Login'); 
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
    }
  };

  const handleSearch = () => {
    navigation.navigate('Search', { currentUser: user }); 
  };

  const handleGoToProfile = () => {
    if (user) {
      navigation.navigate('ViewProfile', { profile1: user, currentUser: user });
    }
  };

  const getInitials = () => {
    try {
      return user.nameFull
        ? user.nameFull
            .split(' ')
            .map(word => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'NN';
    } catch (error) {
      return 'NN';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleGoToProfile} style={styles.avatarWrapper}>
          {user && user.avatarUrl ? (
            <Avatar.Image
              size={40}
              source={{ uri: user.avatarUrl }}
            />
          ) : (
            <Avatar.Text
              size={40}
              label={getInitials()}
              style={styles.avatarFallback}
            />
          )}
        </TouchableOpacity>

        <Text style={styles.username}>
          @{user ? user.nameUser : 'Invitado'}
        </Text>

        <Appbar.Action
          icon="magnify" 
          color="white"
          onPress={handleSearch}
        />

        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#8A2BE2'
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 60,
  },
  avatarWrapper: {
    width: 42, 
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarFallback: {
    backgroundColor: '#BCA1E8', 
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1, 
    textAlign: 'center',
    marginHorizontal: 10,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    paddingLeft: 5,
  }
});

export default ZHeader;
