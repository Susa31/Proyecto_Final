import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ZHeader = ({ username, onLogout }) => {
  return (
    <SafeAreaView
      style={{
        backgroundColor: '#8A2BE2'
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20
        }}
      >

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../Assets/zentroLogo.png')}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30, //Makes it look like a circle
              marginRight: 8,
              borderWidth: 1,
              borderColor: 'white'}}
              resizeMode="cover"
          />
          
        </View>

        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
          @{username}
        </Text>

        <TouchableOpacity onPress={onLogout}>
          <Text style={{ color: 'white', fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );//Closes return (Remember to make the Logout work later)

}; //Closes ZHeader component

export default ZHeader;

//This isn't the final header design, will be styled later
