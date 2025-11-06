import React, { useEffect } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from "react-native-paper";

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Login from './src/Screens/Login';
import Register from './src/Screens/Register';
import PublishPost from './src/Screens/PublishPost';
import Feed from './src/Screens/Feed';
import ViewPost from './src/Screens/ViewPost';
import FollowersList from './src/Screens/FollowersList';
import FollowingList from './src/Screens/FollowingList';
import Search from './src/Screens/Search';
import ViewProfile from './src/Screens/ViewProfile';

const Stack = createNativeStackNavigator();

export default function App() {

  useEffect(() => {
    GoogleSignin.configure({

      webClientId: 'TU_WEB_CLIENT_ID.apps.googleusercontent.com', 
    });
  }, []);
  
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">          
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ title: 'Register'}}
          /> 
          <Stack.Screen
            name="Feed"
            component={Feed}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PublishPost"
            component={PublishPost}
            options={{ title: 'Publish a Post' }}
          />
          <Stack.Screen
            name="ViewPost"
            component={ViewPost}
            options={{ title: 'Post' }}
          />
          <Stack.Screen
            name="ViewProfile"
            component={ViewProfile}
            options={{ title: 'Profile' }}
          />
          <Stack.Screen
            name="FollowersList"
            component={FollowersList}
            options={{ title: 'Followers' }}
          />
          <Stack.Screen
            name="FollowingList"
            component={FollowingList}
            options={{ title: 'Following' }}
          />
          <Stack.Screen
            name="Search"
            component={Search}
            options={{ title: 'Search User' }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}//Closes App