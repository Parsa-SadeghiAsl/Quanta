import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, IconButton } from 'react-native-paper';
import { useAccounts, useDeleteAccount } from '../hooks/useApi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ManagementDialog from '../components/ManagementDialog'; // Import the new component

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Accounts'>;

export default function AccountsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { data: accounts, isLoading, isError } = useAccounts();
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const deleteMutation = useDeleteAccount();

    if (isLoading) {
        return <ActivityIndicator animating={true} style={styles.loader} />;
    }

    if (isError || !accounts) {
        return <Text style={styles.errorText}>Failed to load accounts.</Text>;
    }

    const handleDelete = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete this? This action will also delete all associated transactions and categories.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {deleteMutation.mutate(selectedAccount.id, {onSuccess: () => setDialogVisible(false)})},
                    style: "destructive",
                },
            ]
        );
    };

    const handleLongPress = (account) => {
        setSelectedAccount(account);
        setDialogVisible(true);
    };

    const handleEdit = () => {
        setDialogVisible(false);
        navigation.navigate('AddAccount', { item: selectedAccount });
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={accounts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Card style={styles.card}>
                        <Card.Title
                            title={`${item.name} (${item.account_type})`}
                            subtitle={'Balance:'}
                            right={(props) => <IconButton {...props} icon="dots-vertical" onPress={() => handleLongPress(item)} />}
                        />
                        <Card.Content>
                            <Text style={[styles.balance, {color: parseInt(item.balance) > 0 ? 'green' : 'red'}]}>
                                {parseInt(item.balance) > 0 ? `$${item.balance}` : `-$${item.balance.slice(1)}` }
                            </Text>
                        </Card.Content>
                    </Card>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text variant="titleLarge">No Accounts Yet</Text>
                        <Text variant="bodyMedium" style={styles.centerText}>Tap the '+' button to add your first one.</Text>
                    </View>
                )}
            />
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('AddAccount')}
            />
            <ManagementDialog
                visible={dialogVisible}
                onDismiss={() => setDialogVisible(false)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleteLoading={deleteMutation.isLoading}
                itemName={selectedAccount?.name || ''}
                title="Manage Account"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { textAlign: 'center', marginTop: 20 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    centerText: { textAlign: 'center' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 15 },
    card: { marginHorizontal: 16, marginTop: 16 },
    balance: { fontSize: 18, fontWeight: 'bold', marginRight: 16, marginLeft: 2},
});