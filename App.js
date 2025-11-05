import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from "react-native-paper";

import ViewProfileScreen from './src/Screens/ViewProfileScreen';
import FollowersListScreen from './src/Screens/FollowersListScreen';
import FollowingListScreen from './src/Screens/FollowingListScreen';

const Stack = createNativeStackNavigator();

export default function App() {
const easyExampleProfile = {
    id: 1,
    fullName: 'Laura Shigihara',
    userName: 'lauraSH',
    email: 'laura@pvz.com',
    password: '1234567890',
    description: 'Singer and composer of “Zombie on Your Lawn” from PvZ and George’s girlfriend',
    avatarUrl: '',
    followers: [{
        id: 3,fullName: 'Marsiglia Alejandro', userName: 'follower1', description: ''
    }],
    following: [{id: 2,fullName: 'Alejandro Marsiglia', userName: 'following1', description: 'I love your music!'}],
};

return (
    <PaperProvider>
        <NavigationContainer>
            <Stack.Navigator initialRouteName="ViewProfile">
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
    </PaperProvider>
);
}
