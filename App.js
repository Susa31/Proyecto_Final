import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from "react-native-paper";
import ZHeader from './src/Components/ZHeader';
import PublishPost from './src/Screens/PublishPost';
import Feed from './src/Screens/Feed';
import ViewPost from './src/Screens/ViewPost';

const Stack = createNativeStackNavigator();

export default function App() {

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
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
} //Closes App
