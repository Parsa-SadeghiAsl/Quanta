import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

import { useGetAccounts, useGetCategories, useCreateTransaction } from '../hooks/useApi';

export default function AddTransactionScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState('expense'); // 'expense' or 'income'
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: accounts, isLoading: accountsLoading } = useGetAccounts();
  const { data: categories, isLoading: categoriesLoading } = useGetCategories();
  const createTransactionMutation = useCreateTransaction();

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid amount.');
      return;
    }
    if (!selectedAccount) {
      Alert.alert('Invalid Input', 'Please select an account.');
      return;
    }

    const finalAmount = type === 'expense' ? -numericAmount : numericAmount;

    createTransactionMutation.mutate(
      {
        amount: Math.abs(finalAmount).toFixed(2),
        notes,
        account: selectedAccount,
        category: selectedCategory,
        date: new Date().toISOString().split('T')[0], // Today's date
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Transaction saved!');
          navigation.goBack();
        },
        onError: (error) => {
          console.error(error);
          Alert.alert('Error', 'Could not save transaction.');
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <SegmentedButtons
        value={type}
        onValueChange={setType}
        buttons={[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' },
        ]}
        style={styles.input}
      />

      <TextInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        mode="outlined"
        style={styles.input}
      />

      <Text style={styles.pickerLabel}>Account</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedAccount}
          onValueChange={(itemValue) => setSelectedAccount(itemValue)}
        >
          <Picker.Item label="Select an account..." value={null} />
          {accounts?.map((acc) => (
            <Picker.Item key={acc.id} label={acc.name} value={acc.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.pickerLabel}>Category</Text>
       <View style={styles.pickerContainer}>
        <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        >
            <Picker.Item label="Select a category..." value={null} />
            {categories?.filter(cat => type === 'income' ? cat.type === 'income' : cat.type === 'expense').map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
            ))}
        </Picker>
      </View>


      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.button}
        loading={createTransactionMutation.isPending}
        disabled={createTransactionMutation.isPending}
      >
        Save Transaction
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  input: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    marginLeft: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    padding: 10,
  },
});

