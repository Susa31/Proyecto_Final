import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Avatar, Divider, Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { checkIfFollowing, followUser, unfollowUser, updateUserDescription } from '../config/firebaseService';
import { firestore } from '../config/firebase';

const ViewProfile = ({ route, navigation }) => {
  const { profileId, currentUserId } = route.params; 

  const [profile, setProfile] = useState(null); 
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [savingDescription, setSavingDescription] = useState(false);

  useEffect(() => {
    setLoadingProfile(true);
    const unsubscribe = firestore()
      .collection('users')
      .doc(profileId)
      .onSnapshot(
        (documentSnapshot) => {
          if (documentSnapshot.exists) {
            const data = documentSnapshot.data();
            setProfile({ id: documentSnapshot.id, ...data });
            setNewDescription(data.description || '');
          } else {
            console.error("Cannot find profile with ID: ", profileId);
            setProfile(null);
          }
          setLoadingProfile(false);
        },
        (error) => {
          console.error("Error listening to the profile", error);
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
        console.error("Error while verifying 'follow': ", error);
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
      console.error("Error following/stop following: ", error);
      setLoadingFollow(false);
    }
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
        <Text style={styles.errorText}>Profile not found</Text>
        <Button onPress={() => navigation.goBack()}>Go back</Button>
      </View>
    );
  }

  const isMyProfile = currentUserId === profile.id;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        {profile.avatarUrl ? (
          <Avatar.Image size={100} source={{ uri: profile.avatarUrl }} style={styles.avatar} />
        ) : (
          <Avatar.Text size={100} label={getInitials()} style={styles.avatar} />
        )}
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
            <Button
              mode="contained"
              icon="plus"
              onPress={() => 
                navigation.navigate('PublishPost', { 
                  user: profile,
                  onPublish: () => {
                    navigation.replace('Feed', { user: profile });
                  }
                })
              }
            >
              New Post
            </Button>


      
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

      <Card style={styles.profileCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>About me</Text>
          <Divider style={styles.divider} />

          {isMyProfile && editingDescription ? (
            <View>
              <TextInput
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                style={styles.input}
                placeholder="Write something about yourself..."
              />
              <Button
                mode="contained"
                loading={savingDescription}
                disabled={savingDescription}
                onPress={async () => {
                  setSavingDescription(true);
                  try {
                    await updateUserDescription(profile.id, newDescription);
                    setEditingDescription(false);
                  } catch (error) {
                    console.error("Failed to update description", error);
                  } finally {
                    setSavingDescription(false);
                  }
                }}
              >
                Save
              </Button>
              <Button
                mode="text"
                onPress={() => setEditingDescription(false)}
              >
                Cancel
              </Button>
            </View>
          ) : (
            <View>
              <Text style={styles.biography}>
                {profile.description || "Hello there! I am using this app :D"}
              </Text>
              {isMyProfile && (
                <Button
                  mode="text"
                  onPress={() => setEditingDescription(true)}
                >
                  Edit
                </Button>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}; 

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
  },
  input: {
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
});

export default ViewProfile;