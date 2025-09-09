import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, FAB, Appbar, IconButton, ProgressBar, MD3Colors } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useBudgets, useDeleteBudget } from '../hooks/useApi';
import { format, parseISO } from 'date-fns';

export default function BudgetsScreen() {
    const navigation = useNavigation();
    const { data: budgets, isLoading } = useBudgets();
    const deleteMutation = useDeleteBudget();

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
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
                            right={(props) => (
                                <>
                                    <IconButton {...props} icon="pencil" onPress={() => navigation.navigate('AddBudget', { item })} />
                                    <IconButton {...props} icon="delete" onPress={() => handleDelete(item.id)} />
                                </>
                            )}
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
