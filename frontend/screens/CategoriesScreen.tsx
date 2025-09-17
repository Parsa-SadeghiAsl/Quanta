import React, { useState, useCallback, useRef } from 'react';
import { View, Alert, FlatList, StyleSheet } from 'react-native';
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
    const [isFabVisible, setIsFabVisible] = useState(true);
    const lastScrollY = useRef(0);

    const handleScroll = useCallback((event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
        const scrollThreshold = 10; // A small buffer

        if (scrollDirection === 'down' && currentScrollY > scrollThreshold && isFabVisible) {
            setIsFabVisible(false);
        } else if (scrollDirection === 'up' && !isFabVisible) {
            setIsFabVisible(true);
        }

        lastScrollY.current = currentScrollY;
    }, [isFabVisible]);

    const handleLongPress = (category) => {
        setSelectedCategory(category);
        setDialogVisible(true);
    };

    const handleEdit = () => {
        setDialogVisible(false);
        navigation.navigate('AddCategory', { item: selectedCategory });
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Recurring Transaction",
            "Are you sure you want to delete this? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => { deleteMutation.mutate(selectedCategory.id, { onSuccess: () => setDialogVisible(false) }), setDialogVisible(false) },

                    style: "destructive",
                },
            ]
        );
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
                onScroll={handleScroll}
                scrollEventThrottle={16}
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
                visible={isFabVisible}
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

