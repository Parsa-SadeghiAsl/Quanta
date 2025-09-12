import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, FAB, ActivityIndicator } from 'react-native-paper';
import { useAccounts } from '../hooks/useApi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Accounts'>;

export default function AccountsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { data: accounts, isLoading, isError } = useAccounts();

    if (isLoading) {
        return <ActivityIndicator animating={true} style={styles.loader} />;
    }

    if (isError || !accounts) {
        return <Text style={styles.errorText}>Failed to load accounts.</Text>;
    }

    return (
        <View style={styles.container}>

                <FlatList
                    data={accounts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Card style={styles.card}>
                            <Card.Title
                                title={item.name}
                                subtitle={item.account_type}
                                right={(props) => <Text {...props} style={styles.balance}>${item.balance}</Text>}
                            />
                        </Card>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text variant="titleLarge">No Accounts Yet</Text>
                            <Text variant="bodyMedium" style={styles.centerText}>Tap the '+' button to add your first one.</Text>
                        </View>
                    )}                        
                /> 
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('AddAccount')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { textAlign: 'center', marginTop: 20 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    centerText: { textAlign: 'center' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 15 },
    card: { marginHorizontal: 16, marginTop: 16 },
    balance: { fontSize: 18, fontWeight: 'bold', marginRight: 16 },
});

