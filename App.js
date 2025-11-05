import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from "react-native-paper";
import ZHeader from './src/Components/ZHeader';
import PublishPost from './src/Screens/PublishPost';
import Feed from './src/Screens/Feed';
import ViewPost from './src/Screens/ViewPost';
import ViewProfileScreen from './src/Screens/ViewProfileScreen';
import FollowersListScreen from './src/Screens/FollowersListScreen';
import FollowingListScreen from './src/Screens/FollowingListScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  /*const easyExampleProfile = {
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
    following: [{id: 2,fullName: 'Alejandro Marsiglia', userName: 'following11', description: 'I love your music!'}],
};-*/


  const username = "UserHolda"; 
  //Work with user data later, just a placeholder for now
  //ZHeader is added globally, may change later

  return (
    <PaperProvider>
      <NavigationContainer>
        <ZHeader username = {username}/> 
        <Stack.Navigator initialRouteName="Feed">
          <Stack.Screen
            name="Feed"
            component={Feed}
            options={{ headerShown: false }}
            initialParams={{ username }}
          />
          <Stack.Screen
            name="PublishPost"
            component={PublishPost}
            options={{ headerShown: false }}
            initialParams={{username}}
          />
          <Stack.Screen
            name="ViewPost"
            component={ViewPost}
            options={{ title: 'Post' }}
          />
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


