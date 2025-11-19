import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert, Text, FlatList, Image} from 'react-native';
import { Card, Avatar, Divider, Button, TextInput, IconButton } from 'react-native-paper'; 
import { 
    checkIfFollowing, 
    followUser, 
    unfollowUser, 
    updateUserProfile, 
    updateUserDescription,
    getAllUserActivityForProfile
} from '../config/firebaseService';
import { firestore } from '../config/firebase'; 
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadMediaToCloudinary } from '../config/imageService';
import { useIsFocused } from '@react-navigation/native';
import Video from 'react-native-video';
import { GlobalStyles } from '../Styles/Styles';

const ViewProfile = ({ route, navigation }) => {
    const { profileId, currentUserId, onAvatarUpdate, currentUser } = route.params;
    const [profile, setProfile] = useState(null); 
    const [isFollowing, setIsFollowing] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingFollow, setLoadingFollow] = useState(false);
    const [isUploading, setIsUploading] = useState(false); 
    const [editingDescription, setEditingDescription] = useState(false);
    const [newDescription, setNewDescription] = useState('');
    const [savingDescription, setSavingDescription] = useState(false);
    const [activityPosts, setActivityPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const isFocused = useIsFocused();

    const loggedInUser = currentUser || { id: currentUserId };

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
                        if (!editingDescription) { 
                            setNewDescription(data.description || '');
                        }
                    } else {
                        console.error("Profile not found with ID: ", profileId);
                        setProfile(null);
                    }
                    setLoadingProfile(false);
                },
                (error) => {
                    console.error("Error loading profile: ", error);
                    setLoadingProfile(false);
                }
            );
        return () => unsubscribe(); 
    }, [profileId, editingDescription]); 

    useEffect(() => {
        if (!profileId || !isFocused) return;

        const fetchActivity = async () => {
            setLoadingPosts(true);
            try {
                const activity = await getAllUserActivityForProfile(profileId, currentUserId);
                setActivityPosts(activity);
            } catch (error) {
                console.error("Error loading profile activity: ", error);
            } finally {
                setLoadingPosts(false);
            }
        };
        fetchActivity();
    }, [profileId, isFocused, currentUserId]);

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
                console.error("Error checking follow status: ", error);
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
            console.error("Error following/unfollowing: ", error);
            if (error.message.includes('firestore/not-found') || error.message.includes('user-not-found')) {
                Alert.alert("Profile Error", "Cannot perform action. User profile or your profile could not be found in database.");
            } else {
                Alert.alert("Error", "An error occurred while trying to follow/unfollow.");
            }
            setLoadingFollow(false); 
        }
    };

    const handleSelectImage = () => {
        if (isUploading) return; 
        launchImageLibrary(
            { mediaType: 'photo', quality: 0.7 }, 
            async (response) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    Alert.alert("Error", "Could not select image.");
                    return;
                }
                const uri = response.assets[0].uri;
                if (!uri) return;
                
                setIsUploading(true); 
                try {
                    const asset = response.assets[0];
                    const avatarUrl = await uploadMediaToCloudinary(asset.uri, asset.type);
                    await updateUserProfile(currentUserId, { avatarUrl: avatarUrl });
                    if (onAvatarUpdate) { 
                        onAvatarUpdate(avatarUrl); 
                    }
                    console.log("Profile picture updated!");
                } catch (error) {
                    console.error("Failed to upload new profile picture: ", error);
                    Alert.alert("Error", "Could not update your profile picture.");
                } finally {
                    setIsUploading(false);
                }
            }
        );
    };
    
    const handleSaveDescription = async () => {
        setSavingDescription(true);
        try {
            await updateUserDescription(profile.id, newDescription);
            setEditingDescription(false);
        } catch (error) {
            console.error("Failed to update description", error);
        } finally {
            setSavingDescription(false);
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

    const renderActivityItem = ({ item }) => (
        <View> 
            {item.isRepost && (
            <View style={GlobalStyles.repostContainer}>
                <IconButton icon="repeat-variant" size={16} color="gray" style={{margin: 0, padding: 0}} />
                <Text style={GlobalStyles.repostText}>{item.authorNameFull} Reposted</Text>
            </View>
            )}
            <TouchableOpacity
                onPress={() => navigation.navigate('ViewPost', { 
                    post: item, 
                    user: loggedInUser
                })}
            >
            <Card style={item.isRepost ? GlobalStyles.repostCard : GlobalStyles.card}>
                <Card.Content>
                    <View style={GlobalStyles.postHeader}>
                        <Text style={GlobalStyles.postNames}>
                            {item.isRepost ? item.originalAuthorNameFull : item.authorNameFull} 
                            <Text style={{fontWeight: 'normal', color: 'gray'}}> @{item.isRepost ? item.originalAuthorNameUser : item.authorNameUser}</Text>
                        </Text>
                        <Text style={GlobalStyles.postDate}>{item.createdAt}</Text>
                    </View>
                {item.text ? (<Text style={GlobalStyles.postContent}>{item.text}</Text>) : null}
                {item.mediaType === 'image' && item.mediaUrl && (
                    <Image 
                        source={{ uri: item.mediaUrl }} 
                        style={GlobalStyles.postImage} 
                        resizeMode="cover"
                    />
                )}
                {item.mediaType === 'video' && item.mediaUrl && (
                    <Video
                        source={{ uri: item.mediaUrl }}
                        style={GlobalStyles.postVideo} 
                        resizeMode="contain"
                        controls={true}
                        paused={true}
                    />
                )}
                <View style={GlobalStyles.postActionsText}>
                    <Text style={GlobalStyles.actionText}>{(item.repostCount || 0)} Reposts</Text>
                    <Text style={GlobalStyles.actionText}>{(item.likes || []).length} Likes</Text>
                    <Text style={GlobalStyles.actionText}>{(item.comments || []).length} Comments</Text>
                </View>
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        </View>
    );

    if (loadingProfile) {
        return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
    }
    if (!profile) {
        return (
            <View style={GlobalStyles.whiteContainer}>
                <Text style={GlobalStyles.errorText}>Profile not found</Text>
                <Button onPress={() => navigation.goBack()}>Back</Button>
            </View>
        );
    }
    
    const isMyProfile = currentUserId === profile.id;

    return (
        <FlatList
            style={GlobalStyles.whiteContainer}
            data={activityPosts}
            renderItem={renderActivityItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={
                !loadingPosts && (
                    <Text style={GlobalStyles.emptyTextGeneral}>This user has no recent activity.</Text>
                )
            }
            ListFooterComponent={loadingPosts ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
            ListHeaderComponent={
                <> 
                    <View style={GlobalStyles.profileHeader}>
                        <TouchableOpacity 
                            onPress={isMyProfile ? handleSelectImage : null}
                            disabled={!isMyProfile || isUploading}
                        >
                            <View>
                                {profile.avatarUrl ? (
                                    <Avatar.Image size={100} source={{ uri: profile.avatarUrl }} style={GlobalStyles.avatar} />
                                ) : (
                                    <Avatar.Text size={100} label={getInitials()} style={GlobalStyles.avatar} />
                                )}
                                {isUploading && (
                                    <View style={GlobalStyles.uploadingOverlay}>
                                        <ActivityIndicator size="large" color="#FFFFFF" />
                                    </View>
                                )}
                                {isMyProfile && !isUploading && (
                                    <View style={GlobalStyles.editIcon}>
                                        <Avatar.Icon size={30} icon="pencil" style={{backgroundColor: '#999999'}} />
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                        <Text style={GlobalStyles.profileName}>{profile.nameFull}</Text>
                        <Text style={GlobalStyles.profileUsername}>@{profile.nameUser || profile.userName}</Text> 
                    </View>

                    <View style={GlobalStyles.followContainer}>
                        <TouchableOpacity
                            style={GlobalStyles.followBox}
                            onPress={() => navigation.navigate('FollowersList', { 
                                userId: profile.id,
                                currentUser: loggedInUser
                            })}
                        >
                            <Text style={GlobalStyles.followCount}>{profile.followersCount || 0}</Text>
                            <Text style={GlobalStyles.followLabel}>Followers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={GlobalStyles.followBox}
                            onPress={() => navigation.navigate('FollowingList', { 
                                userId: profile.id,
                                currentUser: loggedInUser
                            })}
                        >
                            <Text style={GlobalStyles.followCount}>{profile.followingCount || 0}</Text>
                            <Text style={GlobalStyles.followLabel}>Following</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={GlobalStyles.followBox}
                            onPress={() => navigation.navigate('PostList', {
                                userId: profile.id,
                                currentUser: loggedInUser
                            })}
                        >
                            <Text style={GlobalStyles.followCount}>{profile.postsCount || 0}</Text>
                            <Text style={GlobalStyles.followLabel}>Posts</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={GlobalStyles.followBox}
                            onPress={() => navigation.navigate('RepostsList', { 
                                userId: profile.id,
                                currentUser: loggedInUser 
                            })}
                        >
                            <Text style={GlobalStyles.followCount}>{profile.repostsCount || 0}</Text>
                            <Text style={GlobalStyles.followLabel}>Reposts</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={GlobalStyles.buttonContainer}>
                        {isMyProfile ? (
                            <Button
                                mode="contained"
                                icon="plus"
                                buttonColor={'#8A2BE2'}
                                onPress={() => 
                                    navigation.navigate('PublishPost', { 
                                    user: profile, 
                                    onPublish: () => {}
                                    })
                                }
                            >
                                Post
                            </Button>
                        ) : (
                            <Button
                                mode={isFollowing ? 'outlined' : 'contained'}
                                onPress={handleFollow}
                                loading={loadingFollow}
                                disabled={loadingFollow}
                                buttonColor={isFollowing ? 'white' : '#8A2BE2'}
                                textColor={isFollowing ? '#8A2BE2' : 'white'}
                                theme={{ colors: { outline: "#8A2BE2" } }}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </Button>
                        )}
                    </View>

                    <Card style={GlobalStyles.profileCard}>
                        <Card.Content>
                        <Text style={GlobalStyles.sectionTitle}>About me</Text>
                        <Divider style={GlobalStyles.divider} />
                        {isMyProfile && editingDescription ? (
                            <View>
                                <TextInput
                                    value={newDescription}
                                    onChangeText={setNewDescription}
                                    multiline
                                    style={GlobalStyles.input}
                                    placeholder="Write something about yourself..."
                                />
                                <Button
                                    mode="contained"
                                    loading={savingDescription}
                                    disabled={savingDescription}
                                    buttonColor={'#8A2BE2'}
                                    onPress={handleSaveDescription}
                                >
                                    Save
                                </Button>
                                <Button
                                    mode="text"
                                    onPress={() => setEditingDescription(false)}
                                    textColor={'#8A2BE2'}
                                >
                                    Cancel
                                </Button>
                            </View>
                        ) : (
                            <View>
                                <Text style={GlobalStyles.biography}>
                                    {profile.description || "Hello there! I am using this app :D"}
                                </Text>
                                <Text></Text>
                                {isMyProfile && (
                                    <Button
                                        mode="text"
                                        onPress={() => setEditingDescription(true)}
                                        textColor={'#8A2BE2'}
                                        icon="pencil"
                                    >
                                        Edit
                                    </Button>
                                )}
                            </View>
                        )}
                        </Card.Content>
                    </Card>
                    
                    {activityPosts.length > 0 && (
                        <Text style={GlobalStyles.sectionTitleFeed}>Recent Activity</Text>
                    )}
                </>
            }
        />
    );
}; 

export default ViewProfile;