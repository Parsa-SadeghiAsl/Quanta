import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, HelperText, PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { useNavigation , useRoute } from '@react-navigation/native';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import { useCreateAccount, useUpdateAccount } from '../hooks/useApi';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
  },
};

const schema = z.object({
  name: z.string().min(1, 'Account name is required'),
  account_type: z.enum(['bank', 'cash', 'credit'], { required_error: 'Account type is required' }),
  balance: z.string().min(1, 'Initial balance is required'),
});

export default function AddAccountScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [account_type, setType] = useState('bank');
  const [balance, setBalance] = useState('');
  const route = useRoute();
  const item = route.params?.item;
  const isEditing = !!item;

  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();


  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
        name: item?.name || '',
        account_type: item?.account_type || 'bank',
        balance: item?.balance || '0.00',
    },
  });

  const onSubmit = (data) => {
    const mutation = isEditing ? updateMutation : createMutation;
    const payload = { ...data };
    if (isEditing) {
        payload.id = item.id;
    }

    mutation.mutate(payload, {
        onSuccess: () => navigation.goBack(),
    });
  };

  return (
    <PaperProvider theme={theme}>
      <ScrollView style={styles.container}>
        <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
          <TextInput label="Account Name" value={value} onBlur={onBlur} onChangeText={onChange} error={!!errors.name} style={styles.input} />
        )}/>
        {errors.name && <HelperText type="error">{errors.name.message}</HelperText>}

        <Controller control={control} name="account_type" render={({ field: { onChange, value } }) => (
          <View style={styles.pickerContainer}>
            <Picker selectedValue={value} onValueChange={onChange}>
              <Picker.Item label="Bank Account" value="bank" />
              <Picker.Item label="Cash" value="cash" />
              <Picker.Item label="Credit Card" value="credit" />
            </Picker>
          </View>
        )} />
        {errors.account_type && <HelperText type="error">{errors.account_type.message}</HelperText>}

        <Controller control={control} name="balance" render={({ field: { onChange, onBlur, value } }) => (
          <TextInput label="Current Balance" value={value} onBlur={onBlur} onChangeText={onChange} keyboardType="numeric" error={!!errors.balance} style={styles.input} />
        )} />
        {errors.balance && <HelperText type="error">{errors.balance.message}</HelperText>}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
          loading={createMutation.isLoading || updateMutation.isLoading}
        >
          {isEditing ? 'Save Changes' : 'Create Account'}
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

