import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { useCreateAccount } from '../hooks/useApi';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
  },
};

export default function AddAccountScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [account_type, setType] = useState('bank');
  const [balance, setBalance] = useState('');

  const createAccountMutation = useCreateAccount();

  const handleSave = () => {
    if (!name.trim() || !balance.trim()) {
      Alert.alert('Invalid Input', 'Please fill in all fields.');
      return;
    }
    const numericBalance = parseFloat(balance);
    if (isNaN(numericBalance)) {
        Alert.alert('Invalid Input', 'Please enter a valid number for the balance.');
        return;
    }

    createAccountMutation.mutate(
      {
        name,
        account_type,
        balance: numericBalance.toFixed(2),
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Account created successfully!');
          navigation.goBack();
        },
        onError: (error) => {
          console.error('Failed to create account:', error);
          Alert.alert('Error', 'Failed to create account. Please try again.');
        },
      }
    );
  };

  return (
    <PaperProvider theme={theme}>
      <ScrollView style={styles.container}>
        <TextInput
          label="Account Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Initial Balance"
          value={balance}
          onChangeText={setBalance}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <Text style={styles.pickerLabel}>Account Type</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={account_type} onValueChange={(itemValue) => setType(itemValue)}>
            <Picker.Item label="Bank Account" value="bank" />
            <Picker.Item label="Cash" value="cash" />
            <Picker.Item label="Credit Card" value="credit" />
          </Picker>
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          loading={createAccountMutation.isPending}
          disabled={createAccountMutation.isPending}
        >
          Save Account
        </Button>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  input: { marginBottom: 15 },
  pickerLabel: { fontSize: 16, color: '#666', marginBottom: 5, marginLeft: 5 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15 },
  button: { marginTop: 10, padding: 10, borderRadius: 8 },
});

