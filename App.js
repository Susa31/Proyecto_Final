import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from "react-native-paper";

import Login from './src/Screens/Login';
import Register from './src/Screens/Register';
import ViewUser from './src/Screens/ViewUser';


const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ title: 'Login'}}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ title: 'Register'}}
          />
          <Stack.Screen
            name="VViewUser"
            component={ViewUser}
            options={{ title: 'View User'}}
          />
          
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}