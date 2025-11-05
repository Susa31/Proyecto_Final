import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

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
          <TouchableOpacity onPress={() => navigation.navigate('ViewProfile')}>
            <Image
              source={require('../Assets/zentroLogo.png')}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                marginRight: 8,
                borderWidth: 1,
                borderColor: 'white'}}
                resizeMode="cover"
            />
          </TouchableOpacity>
        </View>

        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
          @{username}
        </Text>

        <TouchableOpacity onPress={onLogout}>
          <Text style={{ color: 'white', fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

};

export default ZHeader;
