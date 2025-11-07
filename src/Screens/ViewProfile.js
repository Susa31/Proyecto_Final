import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Card, Avatar, Divider, Text, Button, ActivityIndicator } from 'react-native-paper';
import { checkIfFollowing, followUser, unfollowUser, updateUserProfile } from '../config/firebaseService';
import { firestore } from '../config/firebase'; 
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadImageToCloudinary } from '../config/imageService';

const ViewProfile = ({ route, navigation }) => {
  const { profileId, currentUserId, onAvatarUpdate } = route.params; 
  const [profile, setProfile] = useState(null); 
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 

  useEffect(() => {
    setLoadingProfile(true);
    const unsubscribe = firestore()
      .collection('users')
      .doc(profileId)
      .onSnapshot(
        (documentSnapshot) => {
          if (documentSnapshot.exists) {
            setProfile({ id: documentSnapshot.id, ...documentSnapshot.data() });
          } else {
            console.error("Could not find the profile with the ID: ", profileId);
            setProfile(null);
          }
          setLoadingProfile(false);
        },
        (error) => {
          console.error("Error fetching profile data: ", error);
          setLoadingProfile(false);
        }
      );
    return () => unsubscribe(); 
  }, [profileId]); 

  useEffect(() => {
    if (!profile || !currentUserId || profile.id === currentUserId) {
      setIsFollowing(false);
      return; 
    }
    setLoadingFollow(true);
    const checkFollow = async () => {
      try {
        const following = await checkIfFollowing(currentUserId, profile.id);
        setIsFollowing(following);
      } catch (error) {
        console.error("Error verifying follow status: ", error);
      } finally {
        setLoadingFollow(false);
      }
    };
    checkFollow();
  }, [profile, currentUserId]); 

  const handleFollow = async () => {
    setLoadingFollow(true);
    try {
      if (isFollowing) {
        await unfollowUser(currentUserId, profile.id);
      } else {
        await followUser(currentUserId, profile.id);
      }
    } catch (error) {
      console.error("Error when following / unfollowing: ", error);
      setLoadingFollow(false); 
    }
  };

  const handleSelectImage = () => {
    if (isUploading) return; 

    launchImageLibrary(
        { mediaType: 'photo', quality: 0.7 }, 
        async (response) => {
            if (response.didCancel) {
                console.log('User cancelled');
                return;
            }
            if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
                Alert.alert("Error", "Could not select the image");
                return;
            }

            const uri = response.assets[0].uri;
            if (!uri) return;
            
            setIsUploading(true);
            
            try {
                console.log("Uploading new profile photo to Cloudinary...");
                const avatarUrl = await uploadImageToCloudinary(uri);
                
                console.log("Uploading profile in Firestore...");
                await updateUserProfile(currentUserId, { avatarUrl: avatarUrl });
                
                if (onAvatarUpdate) {
                    onAvatarUpdate(avatarUrl);
                }

                console.log("Profile photo updated!");

            } catch (error) {
                console.error("Error when uploading the new profile photo: ", error);
                Alert.alert("Error", "Could not update your profile photo");
            } finally {
                setIsUploading(false);
            }
        }
    );
  };
  
  const getInitials = () => {
    try {
      if (!profile || !profile.nameFull) return '...';
      return profile.nameFull
        ? profile.nameFull.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()
        : '';
    } catch (error) {
      return '';
    }
  };

  if (loadingProfile) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  }
  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profile was not found</Text>
        <Button onPress={() => navigation.goBack()}>Back</Button>
      </View>
    );
  }
  
  const isMyProfile = currentUserId === profile.id;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>

        <TouchableOpacity 
          onPress={isMyProfile ? handleSelectImage : null}
          disabled={!isMyProfile || isUploading}
        >
          <View>
            {profile.avatarUrl ? (
              <Avatar.Image size={100} source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : (
              <Avatar.Text size={100} label={getInitials()} style={styles.avatar} />
            )}
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
            {isMyProfile && !isUploading && (
              <View style={styles.editIcon}>
                <Avatar.Icon size={30} icon="pencil" style={{backgroundColor: '#999999'}} />
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        <Text style={styles.profileName}>{profile.nameFull}</Text>
        <Text style={styles.profileUsername}>@{profile.nameUser || profile.userName}</Text> 
      </View>

      <View style={styles.followContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('FollowersList', { 
              userId: profile.id,
              currentUserId: currentUserId
            })}
        >
          <Text style={styles.followCount}>{profile.followersCount || 0}</Text>
          <Text style={styles.followLabel}>Followers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('FollowingList', { 
              userId: profile.id,
              currentUserId: currentUserId
            })}
        >
          <Text style={styles.followCount}>{profile.followingCount || 0}</Text>
          <Text style={styles.followLabel}>Following</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        {isMyProfile ? (
            <Button mode="outlined" disabled>This is your profile</Button>
        ) : (
            <Button
              mode={isFollowing ? 'outlined' : 'contained'}
              onPress={handleFollow}
              loading={loadingFollow}
              disabled={loadingFollow}
              color={isFollowing ? '#888' : '#6200EE'}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
        )}
      </View>

      {profile.description ? (
        <Card style={styles.profileCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>About me</Text>
            <Divider style={styles.divider} />
            <Text style={styles.biography}>{profile.description}</Text>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.profileCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>About me</Text>
            <Divider style={styles.divider} />
            <Text>Hello there! I am using this app :D</Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};//Closes ViewProfile

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  errorText: {
    textAlign: 'center', 
    marginTop: 30, 
    fontSize: 18
  },
  profileHeader: { 
    alignItems: 'center', 
    padding: 20, 
  },
  avatar: { 
    marginBottom: 10, 
  },
  uploadingOverlay: {
      ...StyleSheet.absoluteFillObject, 
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 50,
  },
  editIcon: {
      position: 'absolute',
      bottom: 5,
      right: -5,
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 2,
  },
  profileName: { 
    fontSize: 22, 
    fontWeight: 'bold', 
  },
  profileUsername: { 
    fontSize: 16, 
    color: 'gray', 
  },
  followContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    padding: 10, 
    borderTopWidth: 1, 
    borderBottomWidth: 1, 
    borderColor: '#eee', 
  },
  followCount: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center', 
  },
  followLabel: { 
    fontSize: 14, 
    color: 'gray', 
    textAlign: 'center', 
  },
  buttonContainer: { 
    padding: 20, 
  },
  profileCard: { 
    margin: 15, 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
  },
  divider: { 
    marginVertical: 10, 
  },
  biography: { 
    fontSize: 16, 
  }
});//Closes Styles

export default ViewProfile;
