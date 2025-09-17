import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Button, TextInput, Card, HelperText, RadioButton, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCategory, useUpdateCategory } from '../hooks/useApi';
import ColorPicker, { Panel1, Swatches } from 'reanimated-color-picker';


const schema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: z.enum(['income', 'expense'], {
    required_error: 'Category type is required',
  }),
  color: z.string().min(1, 'Color is required'),
})

// Define a custom palette of colors for the swatches
const customSwatches = [
  '#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c',
  '#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff',
  '#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d',
];


export default function AddCategoryScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const item = route.params?.item
  const isEditing = !!item

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: item?.name || '',
      type: item?.type || 'expense',
      color: item?.color || '#A8DADC',
    },
  })

  const [pickerColor, setPickerColor] = useState(watch('color'))

  const onSelectColorComplete = ({ hex }) => {
    // --- THIS IS THE FIX ---
    // Ensure the hex color is always in #RRGGBB format (7 characters)
    // by trimming any extra characters from the alpha channel.
    const formattedHex = hex.substring(0, 7);
    setValue('color', formattedHex, { shouldValidate: true })
  }

  const onSubmit = (data) => {
    const mutation = isEditing ? updateMutation : createMutation
    const payload = { ...data }
    if (isEditing) {
      payload.id = item.id
    }

    mutation.mutate(payload, {
      onSuccess: () => navigation.goBack(),
      onError: (error) => {
        if (error.response) {
          console.error('Validation Error:', error.response.data);
        } else if (error.request) {
          console.error('Network Error:', error.request);
        } else {
          console.error('Error:', error.message);
        }
      },
    })
  }

  if (Object.keys(errors).length > 0) {
    console.log('Validation Errors:', errors)
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card.Content>
        <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
                label="Category Name"
                value={value}
                onBlur={onBlur}
                mode="outlined"
                onChangeText={onChange}
                error={!!errors.name}
                style={styles.input}
            />
            )}
        />
        {errors.name && (
            <HelperText type="error" visible={!!errors.name}>
            {errors.name.message}
            </HelperText>
        )}

        <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
            <RadioButton.Group onValueChange={onChange} value={value}>
                <View style={styles.radioContainer}>
                <View style={styles.radioItem}>
                    <RadioButton value="expense" />
                    <Text>Expense</Text>
                </View>
                <View style={styles.radioItem}>
                    <RadioButton value="income" />
                    <Text>Income</Text>
                </View>
                </View>
            </RadioButton.Group>
            )}
        />
        {errors.type && (
            <HelperText type="error" visible={!!errors.type}>
            {errors.type.message}
            </HelperText>
        )}

        <Text style={styles.label}>Selected Color:</Text>
        <View
            style={[styles.colorPreview, { backgroundColor: pickerColor }]}
        />

        <ColorPicker
            style={styles.colorPicker}
            value={pickerColor}
            onComplete={onSelectColorComplete}
            onChange={({ hex }) => setPickerColor(hex)}
        >
            <Swatches colors={customSwatches} />
        </ColorPicker>
        {errors.color && (
            <HelperText type="error" visible={!!errors.color}>
            {errors.color.message}
            </HelperText>
        )}

        <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={createMutation.isLoading || updateMutation.isLoading}
            style={styles.button}
        >
            {isEditing ? 'Save Changes' : 'Create Category'}
        </Button>
        </Card.Content>
      </ScrollView>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    padding: 10,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    padding: 10,
  },
    radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  radioItem: { flexDirection: 'row', alignItems: 'center' },

  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },

  colorPreview: {
    width: '100%',
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },

  colorPicker: {
    height: 150,
    width: '100%',
  },
});