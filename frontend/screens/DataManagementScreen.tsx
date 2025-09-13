import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useImportTransactions, useExportTransactions } from '../hooks/useApi';

export default function DataManagementScreen() {
    const navigation = useNavigation();
    const importMutation = useImportTransactions();
    const { refetch: exportData, isFetching: isExporting } = useExportTransactions();

    const handleImport = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });

        if (!result.canceled) {
            const file = result.assets[0];
            const formData = new FormData();
            formData.append('file', {
                uri: file.uri,
                name: file.name,
                type: 'text/csv',
            } as any);

            importMutation.mutate(formData, {
                onSuccess: (response) => {
                    Alert.alert(
                        'Import Complete',
                        `Successfully created ${response.data.created} transactions.\nSkipped ${response.data.skipped} rows.`
                    );
                },
                onError: (error: any) => {
                    console.error("Import Error:", error.response?.data);
                    Alert.alert('Import Failed', 'There was an error processing your file.');
                },
            });
        }
    };

    const handleExport = async () => {
        try {
            const { data: csvString } = await exportData();
            if (!csvString) {
                throw new Error("No data received from server.");
            }

            const fileUri = FileSystem.cacheDirectory + 'transactions.csv';
            await FileSystem.writeAsStringAsync(fileUri, csvString, {
                encoding: FileSystem.EncodingType.UTF8
            });
            
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Export Transactions',
            });
        } catch (error) {
            console.error("Export Error:", error);
            Alert.alert('Export Failed', 'Could not export your data.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Card style={styles.card}>
                    <Card.Title title="Import Transactions" />
                    <Card.Content>
                        <Text>Import transactions from a CSV file. The file should have columns: 'date', 'account', 'category', 'amount', 'notes'.</Text>
                    </Card.Content>
                    <Card.Actions>
                        {importMutation.isLoading ? (
                            <ActivityIndicator />
                        ) : (
                            <Button icon="upload" mode="contained" onPress={handleImport}>
                                Import CSV
                            </Button>
                        )}
                    </Card.Actions>
                </Card>

                <Card style={styles.card}>
                    <Card.Title title="Export Transactions" />
                    <Card.Content>
                        <Text>Export all of your transaction data to a CSV file.</Text>
                    </Card.Content>
                    <Card.Actions>
                        {isExporting ? (
                            <ActivityIndicator />
                        ) : (
                            <Button icon="download" mode="contained" onPress={handleExport}>
                                Export CSV
                            </Button>
                        )}
                    </Card.Actions>
                </Card>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    card: { marginBottom: 16 },
});
