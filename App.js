import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ViewProfileScreen from './src/screens/ViewProfileScreen';
import FollowersListScreen from './src/screens/FollowersListScreen';
import FollowingListScreen from './src/screens/FollowingListScreen';

const Stack = createNativeStackNavigator();

export default function App() {
const easyExampleProfile = {
    id: 1,
    name: 'Laura',
    lastName: 'Shigihara',
    username: 'lauraSH',
    email: 'laura@pvz.com',
    phone: '1234567890',
    description: 'Singer and composer of “Zombie on Your Lawn” from PvZ and George’s girlfriend',
    avatarUrl: '',
    followers: [
        {
            id: 2,
            name: 'George',
            lastName: 'Fan',
            username: 'georgeFan',
            email: 'george@pvz.com',
            description: 'Creator of Plants vs Zombies and Laura’s boyfriend',
            avatarUrl: '',
            followers: [],
            following: [],
        },
        {
            id: 3,
            name: 'Marsiglia',
            lastName: 'Davila',
            username: 'marsiDalej',
            email: 'marsiDalej@gmail.com',
            description: 'Hater of Nicolas’s interfaces',
            avatarUrl: '',
            followers: [],
            following: [],
        },
    ],
    following: [
        {
            id: 4,
            name: 'Luis',
            lastName: 'Flores',
            username: 'Fernanfloo',
            email: 'fernanfloo@yt.com',
            description: 'Youtube legend',
            avatarUrl: '',
            followers: [],
            following: [],
        },
    ],
};

return (
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen
                name="ViewProfile"
                component={ViewProfileScreen}
                initialParams={{ profile1: easyExampleProfile }}
            />
            <Stack.Screen
                name="FollowersList"
                component={FollowersListScreen}
            />
            <Stack.Screen
                name="FollowingList"
                component={FollowingListScreen}
            />
        </Stack.Navigator>
    </NavigationContainer>
);
}
