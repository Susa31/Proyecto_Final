// App.js
import React, { useEffect } from "react"; // ¡Importamos useEffect!
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from "react-native-paper";

// ¡Importamos la librería de Google!
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import Login from './src/Screens/Login';
import Register from './src/Screens/Register';
import PublishPost from './src/Screens/PublishPost';
import Feed from './src/Screens/Feed';
import ViewPost from './src/Screens/ViewPost';
import ViewProfileScreen from './src/Screens/ViewProfileScreen';
import FollowersListScreen from './src/Screens/FollowersListScreen';
import FollowingListScreen from './src/Screens/FollowingListScreen';
import SearchScreen from './src/Screens/SearchScreen'; 

const Stack = createNativeStackNavigator();

export default function App() {

  // --- ¡ARREGLO DEL ERROR DE HOOKS! ---
  // Todos los Hooks DEBEN ir al principio del componente.
  useEffect(() => {
    GoogleSignin.configure({
      // ¡RECUERDA PEGAR TU 'client_id' (client_type: 3) AQUÍ!
      // Lo encuentras en tu NUEVO google-services.json
      webClientId: 'TU_WEB_CLIENT_ID.apps.googleusercontent.com', 
    });
  }, []); // El array vacío [] significa que esto solo se ejecuta 1 vez
  
  // ¡Cualquier lógica de 'if (usuario)' iría DESPUÉS de los hooks!
  
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
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ViewPost"
            component={ViewPost}
            options={{ title: 'Post' }}
          />
           <Stack.Screen
             name="ViewProfile"
             component={ViewProfileScreen}
             options={{ title: 'Profile' }}
           />
           <Stack.Screen
             name="FollowersList"
             component={FollowersListScreen}
             options={{ title: 'Followers' }}
           />
            <Stack.Screen
               name="FollowingList"
               component={FollowingListScreen}
               options={{ title: 'Following' }}
             />
            <Stack.Screen
               name="Search"
               component={SearchScreen}
               options={{ title: 'Search User' }}
             />

        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}