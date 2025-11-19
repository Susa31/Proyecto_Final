import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebase'; 
import { Appbar, Avatar } from 'react-native-paper'; 
import { GlobalStyles } from '../Styles/Styles';

const ZHeader = ({ user, navigation, avatarUrl, onAvatarUpdate }) => {
  const handleLogout = async () => {
    try {
      await auth().signOut(); 
      navigation.replace('Login'); 
    } catch (error) {
      console.error("Error when logging out: ", error);
    }
  };

  const handleSearch = () => {
    navigation.navigate('Search', { currentUser: user }); 
  };

  const handleGoToProfile = () => {
    if (user && user.id) {
      navigation.navigate('ViewProfile', { 
          profileId: user.id, 
          currentUserId: user.id,
          currentUser: user,
          onAvatarUpdate: onAvatarUpdate 
        });
    }
  };

  const getInitials = () => {
    try {
      if (!user || !user.nameFull) return '..';
      return user.nameFull
        ? user.nameFull.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()
        : 'No Name';
    } catch (error) {
      return 'No Name';
    }
  };

  const currentAvatarUrl = avatarUrl || user?.avatarUrl;

  return (
    <SafeAreaView style={GlobalStyles.headerSafeArea}>
      <View style={GlobalStyles.headerContainer}>
        <TouchableOpacity onPress={handleGoToProfile} style={GlobalStyles.headerAvatarWrapper}>
          {currentAvatarUrl ? (
            <Avatar.Image
              size={50}
              source={{ uri: currentAvatarUrl }}
              key={currentAvatarUrl}
            />
          ) : (
            <Avatar.Text
              size={47}
              label={getInitials()}
              style={GlobalStyles.headerAvatarFallback}
            />
          )}
        </TouchableOpacity>

        <Text style={GlobalStyles.headerUsername}>
          {`@${user ? user.nameUser : 'Guest'}`}
        </Text>

        <Appbar.Action
          icon="magnify" 
          color="white"
          onPress={handleSearch}
        />
        <TouchableOpacity onPress={handleLogout}>
          <Text style={GlobalStyles.headerLogoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ZHeader;