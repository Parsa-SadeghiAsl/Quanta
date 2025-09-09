import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Appbar, Button, TextInput, Text, Card, useTheme, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateRecurringTransaction, useUpdateRecurringTransaction, useAccounts, useCategories } from '../hooks/useApi';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';

const schema = z.object({
    amount: z.string().min(1, 'Amount is required'),
    notes: z.string().optional(),
    accountId: z.string().min(1, 'Account is required'),
    categoryId: z.string().min(1, 'Category is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    startDate: z.date({ required_error: "Start date is required" }),
});

// A safe function to parse 'YYYY-MM-DD' strings into Date objects
const parseDateString = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    // The month is 0-indexed in the JavaScript Date constructor (0=Jan, 1=Feb, etc.)
    return new Date(year, month - 1, day);
};

export default function AddRecurringTransactionScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const theme = useTheme();
    const item = route.params?.item;
    const isEditing = !!item;

    const { data: accounts = [] } = useAccounts();
    const { data: categories = [] } = useCategories();
    const createMutation = useCreateRecurringTransaction();
    const updateMutation = useUpdateRecurringTransaction();

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            amount: item?.amount || '',
            notes: item?.notes || '',
            accountId: item?.account?.toString() || '',
            categoryId: item?.category?.toString() || '',
            frequency: item?.frequency || 'monthly',
            // Use the safe parsing function here
            startDate: item ? parseDateString(item.start_date) : new Date(),
        },
    });

    const startDate = watch('startDate');

    const onSubmit = (data) => {
        const mutation = isEditing ? updateMutation : createMutation;
        const payload = {
            amount: data.amount,
            notes: data.notes,
            frequency: data.frequency,
            start_date: format(data.startDate, 'yyyy-MM-dd'),
            account: data.accountId,
            category: data.categoryId,
        };

        if (isEditing) {
            payload.id = item.id;
        }

        mutation.mutate(payload, {
            onSuccess: () => navigation.goBack(),
        });
    };

    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);
    const handleConfirmDate = (date) => {
        setValue('startDate', date);
        hideDatePicker();
    };

    return (
        <ScrollView style={styles.container}>
            <Controller control={control} name="amount" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput label="Amount" mode='outlined' value={value} onBlur={onBlur} onChangeText={onChange} keyboardType="numeric" error={!!errors.amount} style={styles.input} />
            )} />
            {errors.amount && <HelperText type="error">{errors.amount.message}</HelperText>}

            <Controller control={control} name="notes" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput label="Notes (Optional)" mode='outlined' value={value} onBlur={onBlur} onChangeText={onChange} style={styles.input} />
            )} />

            <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
                <Text style={{ color: theme.colors.primary, fontSize: 16 }}>
                    Start Date: {format(startDate, 'MMMM dd, yyyy')}
                </Text>
            </TouchableOpacity>
            <DateTimePickerModal isVisible={isDatePickerVisible} mode="date" onConfirm={handleConfirmDate} onCancel={hideDatePicker} date={startDate} />
            {errors.startDate && <HelperText type="error">{errors.startDate.message}</HelperText>}

            <Text style={styles.pickerLabel}>Account</Text>
            <Controller control={control} name="accountId" render={({ field: { onChange, value } }) => (
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={value} onValueChange={onChange}>
                        <Picker.Item label="Select Account..." value="" />
                        {accounts.map((acc) => <Picker.Item key={acc.id} label={acc.name} value={acc.id.toString()} />)}
                    </Picker>
                </View>
            )} />
            {errors.accountId && <HelperText type="error">{errors.accountId.message}</HelperText>}

            <Text style={styles.pickerLabel}>Category</Text>
            <Controller control={control} name="categoryId" render={({ field: { onChange, value } }) => (
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={value} onValueChange={onChange}>
                        <Picker.Item label="Select Category..." value="" />
                        {categories.map((cat) => <Picker.Item key={cat.id} label={`${cat.name} (${cat.type})`} value={cat.id.toString()} />)}
                    </Picker>
                </View>
            )} />
            {errors.categoryId && <HelperText type="error">{errors.categoryId.message}</HelperText>}

            <Text style={styles.pickerLabel}>Frequency</Text>
            <Controller control={control} name="frequency" render={({ field: { onChange, value } }) => (
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={value} onValueChange={onChange}>
                        <Picker.Item label="Monthly" value="monthly" />
                        <Picker.Item label="Weekly" value="weekly" />
                        <Picker.Item label="Daily" value="daily" />
                    </Picker>
                </View>
            )} />
            {errors.frequency && <HelperText type="error">{errors.frequency.message}</HelperText>}

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={createMutation.isLoading || updateMutation.isLoading}
                style={styles.button}>
                {isEditing ? 'Save Changes' : 'Save Transaction'}
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',},
    card: { margin: 16 },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
        padding: 10,
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 15,
        marginBottom: 8,
        alignItems: 'center',
    },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    },
    pickerLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
        marginLeft: 5,},
});

