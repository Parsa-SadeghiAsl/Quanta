import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, IconButton, FAB, Dialog, Portal, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useUserCategories, useDeleteCategory } from '../hooks/useApi';

export default function CategoriesScreen() {
    const navigation = useNavigation();
    const { data: categories, isLoading, isFetching, refetch } = useUserCategories();
    const deleteMutation = useDeleteCategory();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);

    const onRefresh = useCallback(() => { refetch(); }, [refetch]);

    const handleLongPress = (category) => {
        setSelectedCategory(category);
        setDialogVisible(true);
    };

    const handleEdit = () => {
        setDialogVisible(false);
        navigation.navigate('AddCategory', { item: selectedCategory });
    };

    const handleDelete = () => {
        deleteMutation.mutate(selectedCategory.id, {
            onSuccess: () => setDialogVisible(false),
        });
    };

    if (isLoading) {
        return <ActivityIndicator animating={true} style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                onRefresh={onRefresh}
                refreshing={isFetching}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text variant="titleLarge">No Custom Categories</Text>
                        <Text variant="bodyMedium" style={styles.centerText}>Tap the '+' button to add your first one.</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <Card style={styles.card}>
                        <Card.Title
                            title={item.name}
                            subtitle={item.type}
                            right={(props) =>
                            <IconButton {...props} icon="dots-vertical" onPress={() => handleLongPress(item)} />}
                            left={(props) => <View {...props} style={[styles.colorDot, { backgroundColor: item.color }]} />}
                        />
                    </Card>
                )}
            />
            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate('AddCategory')}
            />
            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                    <Dialog.Title>Manage Category</Dialog.Title>
                    <Dialog.Content>
                        <Text>What would you like to do with "{selectedCategory?.name}"?</Text>
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
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    centerText: { textAlign: 'center', marginTop: 8 },
    card: { marginHorizontal: 16, marginTop: 16 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 15 },
    colorDot: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: 10,
    },
});

