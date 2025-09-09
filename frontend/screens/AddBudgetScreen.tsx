import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Appbar, Button, TextInput, Text, Card, useTheme, HelperText } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBudget, useUpdateBudget, useCategories } from '../hooks/useApi';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';

const schema = z.object({
    amount: z.string().min(1, 'Amount is required'),
    categoryId: z.string().min(1, 'Category is required'),
    startDate: z.date({ required_error: "Start date is required" }),
    endDate: z.date({ required_error: "End date is required" }),
}).refine(data => data.endDate >= data.startDate, {
    message: "End date cannot be before start date",
    path: ["endDate"],
});

const parseDateString = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export default function AddBudgetScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const theme = useTheme();
    const item = route.params?.item;
    const isEditing = !!item;

    const { data: categories = [] } = useCategories();
    const createMutation = useCreateBudget();
    const updateMutation = useUpdateBudget();

    const [picker, setPicker] = useState<'start' | 'end' | null>(null);

    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            amount: item?.amount || '',
            categoryId: item?.category?.toString() || '',
            startDate: item ? parseDateString(item.start_date) : new Date(),
            endDate: item ? parseDateString(item.end_date) : new Date(),
        },
    });
    
    const { startDate, endDate } = watch();

    const onSubmit = (data) => {
        const mutation = isEditing ? updateMutation : createMutation;
        const payload = {
            amount: data.amount,
            category: data.categoryId,
            start_date: format(data.startDate, 'yyyy-MM-dd'),
            end_date: format(data.endDate, 'yyyy-MM-dd'),
        };

        if (isEditing) payload.id = item.id;

        mutation.mutate(payload, {
            onSuccess: () => navigation.goBack(),
        });
    };

    const handleConfirmDate = (date) => {
        if (picker) setValue(picker === 'start' ? 'startDate' : 'endDate', date);
        setPicker(null);
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={isEditing ? 'Edit Budget' : 'Add Budget'} />
            </Appbar.Header>
            <ScrollView>
                <Card style={styles.card}>
                    <Card.Content>
                        <Controller control={control} name="amount" render={({ field: { onChange, value } }) => (
                            <TextInput label="Budget Amount" value={value} onChangeText={onChange} keyboardType="numeric" error={!!errors.amount} style={styles.input} />
                        )} />
                        {errors.amount && <HelperText type="error">{errors.amount.message}</HelperText>}
                        
                        <Controller control={control} name="categoryId" render={({ field: { onChange, value } }) => (
                            <View style={styles.pickerContainer}>
                                <Picker selectedValue={value} onValueChange={onChange}>
                                    <Picker.Item label="Select Category..." value="" />
                                    {categories.filter(c => c.type === 'expense').map((cat) => <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />)}
                                </Picker>
                            </View>
                        )} />
                        {errors.categoryId && <HelperText type="error">{errors.categoryId.message}</HelperText>}

                        <TouchableOpacity onPress={() => setPicker('start')} style={styles.dateButton}>
                            <Text>Start Date: {format(startDate, 'MMMM dd, yyyy')}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => setPicker('end')} style={styles.dateButton}>
                            <Text>End Date: {format(endDate, 'MMMM dd, yyyy')}</Text>
                        </TouchableOpacity>
                        {errors.endDate && <HelperText type="error">{errors.endDate.message}</HelperText>}

                        <DateTimePickerModal
                            isVisible={picker !== null}
                            mode="date"
                            onConfirm={handleConfirmDate}
                            onCancel={() => setPicker(null)}
                            date={picker === 'start' ? startDate : endDate}
                        />

                        <Button
                            mode="contained"
                            onPress={handleSubmit(onSubmit)}
                            loading={createMutation.isLoading || updateMutation.isLoading}
                            style={styles.button}>
                            {isEditing ? 'Save Changes' : 'Create Budget'}
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    card: { margin: 16 },
    input: { marginBottom: 8 },
    button: { marginTop: 16 },
    dateButton: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 15, marginBottom: 8 },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 8 },
});
