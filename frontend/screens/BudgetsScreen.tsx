import React, {useState} from 'react';
import { View, Alert, FlatList, StyleSheet } from 'react-native';
import { Text, Portal, Dialog, Button, Card, FAB, Appbar, IconButton, ProgressBar, MD3Colors } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useBudgets, useDeleteBudget } from '../hooks/useApi';
import { format, parseISO } from 'date-fns';

export default function BudgetsScreen() {
    const navigation = useNavigation();
    const { data: budgets, isLoading } = useBudgets();
    const deleteMutation = useDeleteBudget();

    const [selectedBudget, setSelectedBudget] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);

    const handleLongPress = (budget) => {
        setSelectedBudget(budget);
        setDialogVisible(true);
    };

    const handleEdit = () => {
        setDialogVisible(false);
        navigation.navigate('AddBudget', { item: selectedBudget });
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Recurring Transaction",
            "Are you sure you want to delete this? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {deleteMutation.mutate(selectedBudget.id, {onSuccess: () => setDialogVisible(false)}), setDialogVisible(false)},
                    
                    style: "destructive",
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="My Budgets" />
            </Appbar.Header>

            <FlatList
                data={budgets}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Card style={styles.card}>
                        <Card.Title
                            title={item.category_details.name}
                            subtitle={`Period: ${format(parseISO(item.start_date), 'MMM dd')} - ${format(parseISO(item.end_date), 'MMM dd')}`}
                            right={(props) =>
                                <IconButton {...props} icon="dots-vertical" onPress={() => handleLongPress(item)} />}
                        />
                        <Card.Content>
                            <View style={styles.progressContainer}>
                                <Text style={styles.progressText}>${item.spent.toFixed(2)} / ${item.amount}</Text>
                                <ProgressBar progress={Math.min(item.spent / parseFloat(item.amount), 1)} color={MD3Colors.primary50} style={styles.progressBar}/>
                            </View>
                        </Card.Content>
                    </Card>
                )}
            />

            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('AddBudget')}
            />
            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                    <Dialog.Title>Manage Budget</Dialog.Title>
                    <Dialog.Content>
                        <Text>What would you like to do with "{selectedBudget?.name}"?</Text>
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
    container: { flex: 1 },
    card: { margin: 16 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 15 },
    progressContainer: { marginTop: 8 },
    progressText: { textAlign: 'right', marginBottom: 4, color: '#666' },
    progressBar: { height: 8, borderRadius: 4 },
});
