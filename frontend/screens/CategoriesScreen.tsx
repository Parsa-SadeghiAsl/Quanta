import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert, Modal, Text } from 'react-native';
import { List, FAB, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useGetCategories, useCreateCategory } from '../hooks/useApi';

const CategoryItem = ({ item }) => (
  <List.Item
    title={item.name}
    left={() => <List.Icon icon="tag" color={item.color} />}
    style={item.type === 'expense' ? styles.expenseItem : styles.incomeItem}
    titleStyle={styles.itemTitle}
  />
);

export default function CategoriesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('expense');
  
  const { data: categories, isLoading } = useGetCategories();
  const createCategoryMutation = useCreateCategory();

  const handleSave = () => {
    if (!newName) {
      Alert.alert('Error', 'Category name cannot be empty.');
      return;
    }
    createCategoryMutation.mutate({
      name: newName,
      type: newType,
      color: newType === 'expense' ? '#FF6347' : '#00FA9A', // A default color
    }, {
      onSuccess: () => {
        setNewName('');
        setModalVisible(false);
      },
      onError: () => Alert.alert('Error', 'Failed to save category.')
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CategoryItem item={item} />}
        refreshing={isLoading}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Category</Text>
            <TextInput
              label="Category Name"
              value={newName}
              onChangeText={setNewName}
              mode="outlined"
              style={styles.input}
            />
            <SegmentedButtons
              value={newType}
              onValueChange={setNewType}
              buttons={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' },
              ]}
              style={styles.input}
            />
            <Button mode="contained" onPress={handleSave} loading={createCategoryMutation.isPending}>Save</Button>
            <Button onPress={() => setModalVisible(false)} style={{marginTop: 10}}>Cancel</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  expenseItem: { backgroundColor: '#FFF0F0', marginVertical: 4, marginHorizontal: 8, borderRadius: 5 },
  incomeItem: { backgroundColor: '#F0FFF0', marginVertical: 4, marginHorizontal: 8, borderRadius: 5 },
  itemTitle: { fontWeight: 'bold' },
  // Modal styles
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '85%', margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { marginBottom: 15 },
});
