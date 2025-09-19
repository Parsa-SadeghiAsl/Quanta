import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Text, Divider, Appbar } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useApi';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CustomDrawerContent(props) {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();

  const getAvatarSource = () => {
    if (profile?.avatar) {
      return { uri: `${API_URL}${profile.avatar}` };
    }
    return require('../assets/icon.png');
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.profileContainer}>
          <Avatar.Image
          size={80}
          source={getAvatarSource()}
          />
          <Text variant="titleLarge" style={styles.username}>{profile?.username || 'User'}</Text>
          <Text variant="bodyMedium" style={styles.email}>{profile?.email}</Text>
      </View>
      <Divider style={{marginBottom: 5}} />
      <DrawerItemList {...props} />
      <DrawerItem
          label="Logout"
          onPress={() => signOut()}
          labelStyle={{ fontWeight: 'bold', color: '#e0002dff' }}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    padding: 10,
    alignItems: 'center',
  },
  username: {
    marginTop: 12,
    fontWeight: 'bold',
  },
  email: {
    color: '#888',
  },
});
