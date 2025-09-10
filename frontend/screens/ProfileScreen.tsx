import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Avatar, Button, Card, TextInput, ActivityIndicator, Text, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfile, useUpdateProfile, useChangePassword } from '../hooks/useApi';


const API_BASE = 'http://192.168.1.102:8000';

const profileSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

const passwordSchema = z.object({
    old_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'New password must be at least 8 characters'),
    new_password_confirm: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.new_password_confirm, {
    message: "Passwords don't match",
    path: ["new_password_confirm"], // Set the error on the confirmation field
});


export default function ProfileScreen() {
    const navigation = useNavigation();
    const { data: profile, isLoading } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();

    const [avatar, setAvatar] = useState<{ uri: string; name: string; type: string } | null>(null);

    const { control: profileControl, handleSubmit: handleProfileSubmit, setValue: setProfileValue, formState: { errors: profileErrors } } = useForm({
        resolver: zodResolver(profileSchema),
    });

    const { control: passwordControl, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPasswordForm } = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: { old_password: '', new_password: '' },
    });

    useEffect(() => {
        if (profile) {
            setProfileValue('username', profile.username);
        }
    }, [profile, setProfileValue]);

    const pickImage = async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
                // --- THIS IS THE FIX ---
                // Replaced deprecated `MediaTypeOptions` with the new `MediaType`
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                const file = result.assets[0];
                const name = file.uri.split('/').pop() || 'avatar.jpg';
                const type = `image/${name.split('.').pop()}`;
                setAvatar({ uri: file.uri, name, type });
            }
        };

    const onProfileSave = (data) => {
        updateProfileMutation.mutate(
            { username: data.username, avatar },
            {
                onSuccess: () => {
                    Alert.alert('Success', 'Profile updated successfully.');
                    setAvatar(null);
                },
                onError: (error: any) => {
                    console.error("Profile update failed:", error.response?.data);
                    Alert.alert('Error', 'Failed to update profile. Please try again.');
                },
            }
        );
    };

    const onPasswordChange = (data) => {
        changePasswordMutation.mutate(data, {
            onSuccess: () => {
                Alert.alert('Success', 'Password changed successfully.');
                resetPasswordForm();
            },
            onError: (error: any) => {
                const message = error.response?.data?.old_password?.[0] || 'Failed to change password.';
                Alert.alert('Error', message);
            },
        });
    };

    if (isLoading) {
        return <ActivityIndicator style={styles.loader} />;
    }
    const getAvatarSource = () => {
        // 2. If there's a saved avatar from the server, construct the full URL.
        if (profile?.avatar) {
            return { uri: `${API_BASE}${profile.avatar}` };
        }
        // 3. Otherwise, show a placeholder.
        return { uri: 'https://placehold.co/100x100?text=User' };
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Card style={styles.card}>
                        <Card.Content style={styles.avatarContainer}>
                            <Avatar.Image
                                size={100}
                                source={getAvatarSource()}
                            />
                            <Button mode="text" onPress={pickImage} style={styles.button}>Change Picture</Button>
                        </Card.Content>

                        <Card.Content>
                        <Text style={styles.textLabel}>Edit Profile</Text>
                            <Controller
                                control={profileControl}
                                name="username"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput label="Username" value={value} onBlur={onBlur} onChangeText={onChange} error={!!profileErrors.username} style={styles.input} />
                                )}
                            />
                            {profileErrors.username && <HelperText type="error">{profileErrors.username.message}</HelperText>}
                            <Button
                                mode="contained"
                                onPress={handleProfileSubmit(onProfileSave)}
                                loading={updateProfileMutation.isLoading}
                                style={styles.button}
                            >
                                Save Profile
                            </Button>
                        </Card.Content>
                    </Card>

                    <Card style={styles.card}>
                        <Card.Title title="Change Password" />
                        <Card.Content>
                            <Controller
                                control={passwordControl}
                                name="old_password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput label="Current Password" value={value} onBlur={onBlur} onChangeText={onChange} secureTextEntry error={!!passwordErrors.old_password} style={styles.input} />
                                )}
                            />
                            {passwordErrors.old_password && <HelperText type="error">{passwordErrors.old_password.message}</HelperText>}
                            <Controller
                                control={passwordControl}
                                name="new_password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput label="New Password" value={value} onBlur={onBlur} onChangeText={onChange} secureTextEntry error={!!passwordErrors.new_password} style={styles.input} />
                                )}
                            />
                            {passwordErrors.new_password && <HelperText type="error">{passwordErrors.new_password.message}</HelperText>}

                            <Controller 
                                control={passwordControl} 
                                name="new_password_confirm" 
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput label="Confirm New Password" value={value} onBlur={onBlur} onChangeText={onChange} secureTextEntry error={!!passwordErrors.new_password_confirm} style={styles.input} />
                                )} 
                            />
                            {passwordErrors.new_password_confirm && <HelperText type="error">{passwordErrors.new_password_confirm.message}</HelperText>}

                            <Button
                                mode="contained"
                                onPress={handlePasswordSubmit(onPasswordChange)}
                                loading={changePasswordMutation.isLoading}
                                style={styles.button}
                            >
                                Change Password
                            </Button>
                        </Card.Content>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    loader: { flex: 1, justifyContent: 'center' },
    card: { marginBottom: 16 },
    avatarContainer: { alignItems: 'center', paddingVertical: 20 },
    input: { marginBottom: 8 },
    button: { marginTop: 16 },
    textLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
        marginLeft: 5,
    },
});

