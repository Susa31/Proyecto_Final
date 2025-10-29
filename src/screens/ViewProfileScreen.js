import React, { useState, useEffect } from 'react';
import { View, ScrollView, Button, TouchableOpacity } from 'react-native';
import { Card, Avatar, Divider, List, FAB, Text } from 'react-native-paper';
import styles from '../styles/screenStyles';

const ViewProfileScreen = ({ route, navigation }) => {
const { profile1 } = route.params;
const [profile, setProfile] = useState(profile1);
const [isFollowing, setIsFollowing] = useState(false);

useEffect(() => {
    console.log('Viewing profile of:', profile.name);
}, [profile]);

const handleGoBack = () => {
    navigation.goBack();
};

const handleFollow = () => {
    if (isFollowing) {
        setIsFollowing(false);
        setProfile(prev => ({
            ...prev,
            followers: prev.followers.filter(u => u.id !== 369),
        }));
    } else {
        setIsFollowing(true);
        setProfile(prev => ({
            ...prev,
            followers: [...(prev.followers || []), { id: 369, username: 'me', description: 'who I am?' }],
        }));
    }
};

const getInitials = () => {
    return `${profile.name?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
};

return (
    <ScrollView style={styles.container}>
    <View style={styles.profileHeader}>
        {profile.avatarUrl ? (
        <Avatar.Image size={100} source={{ uri: profile.avatarUrl }} style={styles.avatar} />
        ) : (
        <Avatar.Text size={100} label={getInitials()} style={styles.avatar} />
        )}
        <Text style={styles.profileName}>{profile.name} {profile.lastName}</Text>
    </View>

    <View style={styles.followContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('FollowersList', { users: profile.followers || [] })}>
        <Text style={styles.followCount}>{profile.followers?.length || 0}</Text>
        <Text style={styles.followLabel}>Followers</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('FollowingList', { users: profile.following || [] })}>
        <Text style={styles.followCount}>{profile.following?.length || 0}</Text>
        <Text style={styles.followLabel}>Following</Text>
        </TouchableOpacity>
    </View>

    <View style={styles.buttonContainer}>
        <Button
        title={isFollowing ? 'Following' : 'Follow'}
        onPress={handleFollow}
        color={isFollowing ? '#888' : '#6200EE'}
        />
    </View>

    <Card style={styles.profileCard}>
        <Card.Content>
        <Text style={styles.sectionTitle}>Contact Info</Text>
        <Divider style={styles.divider} />
        <List.Item title="Email" description={profile.email} left={props => <List.Icon {...props} icon="email" />} />
        <List.Item title="Phone" description={profile.phone} left={props => <List.Icon {...props} icon="phone" />} />
        </Card.Content>
    </Card>

    {profile.description ? (
        <Card style={styles.profileCard}>
        <Card.Content>
            <Text style={styles.sectionTitle}>About me</Text>
            <Divider style={styles.divider} />
            <Text style={styles.biografia}>{profile.description}</Text>
        </Card.Content>
        </Card>
    ) : <Text style={styles.biografia}>Hello there! I am using this app :D</Text>}

    <FAB style={styles.fab} icon="arrow-left" onPress={handleGoBack} label="Volver" />
    </ScrollView>
);
};

export default ViewProfileScreen;