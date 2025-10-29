import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { List, Avatar, Divider } from 'react-native-paper';
import styles from '../styles/screenStyles';

const FollowersListScreen = ({ route, navigation }) => {
const { users } = route.params;

return (
    <ScrollView style={styles.container}>
        {users.map(user => (
            <TouchableOpacity
                key={user.id}
                onPress={() => navigation.navigate('ViewProfile', { profile1: user })}
            >
                <List.Item
                    title={user.username}
                    description={user.description}
                    left={props =>
                        user.avatarUrl ? (
                            <Avatar.Image {...props} source={{ uri: user.avatarUrl }} />
                        ) : (
                            <Avatar.Text
                                {...props}
                                label={`${user.username?.[0] || ''}`.toUpperCase()}
                            />
                        )
                    }
                />
            </TouchableOpacity>
        ))}
        <Divider />
    </ScrollView>
);
};

export default FollowersListScreen;
