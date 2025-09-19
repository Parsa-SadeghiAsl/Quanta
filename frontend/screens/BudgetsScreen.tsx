import React, { useState } from 'react';
import { View, Alert, FlatList, StyleSheet } from 'react-native';
import { Text, Card, FAB, IconButton, ProgressBar, MD3Colors } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useBudgetProgress, useDeleteBudget } from '../hooks/useApi';
import { useDate } from '../components/DateContext';
import { format, parseISO } from 'date-fns';
import { useFabVisibility } from '../hooks/useFabVisibility'; // Import the hook
import ManagementDialog from '../components/ManagementDialog'; // Import the component

export default function BudgetsScreen() {
    const navigation = useNavigation();
    const { selectedYear, selectedMonth } = useDate();
    const { data: budgets, isLoading } = useBudgetProgress(selectedYear, selectedMonth);
    const deleteMutation = useDeleteBudget();
    const { isFabVisible, handleScroll } = useFabVisibility(); // Use the hook

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
            "Delete Budget",
            "Are you sure you want to delete this? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {deleteMutation.mutate(selectedBudget.id, {onSuccess: () => setDialogVisible(false)})},
                    style: "destructive",
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={budgets}
                onScroll={handleScroll}
                scrollEventThrottle={16}
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
                                <Text style={styles.progressText}>${item.spent} / ${item.amount}</Text>
                                <ProgressBar progress={Math.min(item.spent / parseFloat(item.amount), 1)} color={MD3Colors.primary50} style={styles.progressBar}/>
                            </View>
                        </Card.Content>
                    </Card>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text variant="titleLarge">No Budgets Yet</Text>
                        <Text variant="bodyMedium" style={styles.centerText}>Tap the '+' button to add your first one.</Text>
                    </View>
                )}
            />
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('AddBudget')}
                visible={isFabVisible}
            />
            <ManagementDialog
                visible={dialogVisible}
                onDismiss={() => setDialogVisible(false)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleteLoading={deleteMutation.isLoading}
                itemName={selectedBudget?.category_details.name || ''}
                title="Manage Budget"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    card: { margin: 16 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 15 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    centerText: { textAlign: 'center', marginTop: 8 },
    progressContainer: { marginTop: 8 },
    progressText: { textAlign: 'right', marginBottom: 4, color: '#666' },
    progressBar: { height: 8, borderRadius: 4 },
});