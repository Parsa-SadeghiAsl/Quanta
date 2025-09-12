import React, {useState} from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, ActivityIndicator, Button, Portal, Dialog, FAB, Card, IconButton } from 'react-native-paper';
import { useRecurringTransactions, useDeleteRecurringTransaction } from '../hooks/useApi';
import { format, parseISO } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecurringTransactions'>;

export default function RecurringTransactionsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { data: recurring, isLoading, isError } = useRecurringTransactions();
    const deleteMutation = useDeleteRecurringTransaction();

    const [selectedRecurring, setSelectedRecurring] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);

    const handleDelete = () => {
        Alert.alert(
            "Delete Recurring Transaction",
            "Are you sure you want to delete this? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {deleteMutation.mutate(selectedRecurring.id, {onSuccess: () => setDialogVisible(false)}), setDialogVisible(false)},
                    
                    style: "destructive",
                },
            ]
        );
    };

    if (isLoading) {
        return <ActivityIndicator animating={true} style={styles.loader} />;
    }

    if (isError || !recurring) {
        return <Text style={styles.errorText}>Failed to load recurring transactions.</Text>;
    }

    const handleLongPress = (recurring) => {
        setSelectedRecurring(recurring);
        setDialogVisible(true);
    };

    const handleEdit = () => {
        setDialogVisible(false);
        navigation.navigate('AddRecurringTransaction', { item: selectedRecurring });
    };

    return (
        <View style={styles.container}>
                <FlatList
                    data={recurring}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Card style={styles.card}>
                            <Card.Title
                                title={item.notes || 'Monthly Recurring'}
                                subtitle={`Next on: ${format(parseISO(item.next_date), 'MMM dd, yyyy')}`}
                                right={(props) =>
                                    <IconButton {...props} icon="dots-vertical" onPress={() => handleLongPress(item)} />}
                            />
                            <Card.Content>
                                <Text style={[styles.amount, item.category_details?.type === 'income' ? styles.income : styles.expense]}>
                                    {item.category_details?.type === 'income' ? '+' : '-'}${item.amount}
                                </Text>
                                <Text>{item.account_details?.name}</Text>
                            </Card.Content>
                        </Card>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text variant="titleLarge">No Recurrings Yet</Text>
                            <Text variant="bodyMedium" style={styles.centerText}>Tap the '+' button to add your first one.</Text>
                        </View>
                    )}
                />
            
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('AddRecurringTransaction', { item: null })}
            />
            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                    <Dialog.Title>Manage Recurring Transactions</Dialog.Title>
                    <Dialog.Content>
                        <Text>What would you like to do with "{selectedRecurring?.notes || 'Monthly Recurring'}"?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={handleEdit}>Edit</Button>
                        <Button onPress={handleDelete} loading={deleteMutation.isLoading}>Delete</Button>
                        <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
    actions: { flexDirection: 'row' },
    amount: { fontSize: 18, fontWeight: 'bold' },
    income: { color: 'green' },
    expense: { color: 'red' },
});

