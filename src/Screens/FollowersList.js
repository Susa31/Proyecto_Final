import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { List, Avatar, Divider, Button } from 'react-native-paper';
import { firestore } from '../config/firebase';
import { useIsFocused } from '@react-navigation/native';
import { GlobalStyles } from '../Styles/Styles';

const itemsPage = 10;

const FollowersList = ({ route, navigation }) => {
    const { userId, currentUser } = route.params;
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const isFocused = useIsFocused();

    useEffect(() => {
        const fetchFollowers = async () => {
            setLoading(true);
            try {
                const followersList = [];
                const snapshot = await firestore()
                    .collection('users')
                    .doc(userId)
                    .collection('followers')
                    .get();

                for (const doc of snapshot.docs) {
                    const userProfileDoc = await firestore().collection('users').doc(doc.id).get();
                    if (userProfileDoc.exists) {
                        followersList.push({ id: userProfileDoc.id, ...userProfileDoc.data() });
                    }
                }
                
                const sortedUsers = followersList.sort((a, b) =>
                    (a.nameFull || '').toLowerCase().localeCompare((b.nameFull || '').toLowerCase())
                );

                setUsers(sortedUsers);
            } catch (error) {
                console.log('Error loading followers list', error);
            } finally {
                setLoading(false);
            }
        };

        if (isFocused) {
            fetchFollowers();
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
                    currentUserId: currentUser.id,
                    currentUser: currentUser
                })}
            >
                <List.Item
                    title={item.nameFull}
                    description={'@' + (item.nameUser || item.userName)}
                    titleStyle={GlobalStyles.listItemTitle}
                    descriptionStyle={GlobalStyles.listItemDescription}
                    style={GlobalStyles.listItem}
                    left={props =>
                        item.avatarUrl ? (
                            <Avatar.Image {...props} source={{ uri: item.avatarUrl }} size={48} />
                        ) : (
                            <Avatar.Text
                                {...props}
                                label={`${item.nameFull?.[0] || ''}`.toUpperCase()}
                                size={48}
                                style={{ backgroundColor: '#7C4DFF' }}
                                color='#FFFFFF'
                            />
                        )
                    }
                />
                <Divider style={GlobalStyles.divider} />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <ActivityIndicator style={{ marginTop: 30 }} size="large" />;
    }

    return (
        <View style={GlobalStyles.whiteContainer}>
            <FlatList
                data={paginatedUsers}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={
                    <Text style={GlobalStyles.emptyTextList}>
                        This user has no followers, yet...
                    </Text>
                }
            />
            <View style={GlobalStyles.paginationContainerList}>
                <Button mode='outlined' disabled={page === 1} onPress={() => setPage(page - 1)}>
                    Previous
                </Button>
                <Text style={GlobalStyles.paginationTextList}>Page {page} of {totalPages}</Text>
                <Button mode='outlined' disabled={page === totalPages} onPress={() => setPage(page + 1)}>
                    Next
                </Button>
            </View>
        </View>
    );
};

export default FollowersList;