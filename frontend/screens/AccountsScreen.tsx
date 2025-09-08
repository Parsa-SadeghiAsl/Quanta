import React from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { List, FAB, PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { useGetAccounts } from '../hooks/useApi';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
  },
};

const AccountItem = ({ item }) => (
  <List.Item
    title={item.name}
    description={`Type: ${item.account_type}`}
    right={() => <Text style={styles.balance}>${parseFloat(item.balance).toFixed(2)}</Text>}
    left={() => <List.Icon icon="bank" />}
    style={styles.item}
  />
);

export default function AccountsScreen() {
  const { data: accounts, isLoading, isError } = useGetAccounts();

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  if (isError) {
    return <Text style={styles.errorText}>Failed to load accounts.</Text>;
  }

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <AccountItem item={item} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No accounts found. Add one to get started!</Text>}
        />
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => console.log('Navigate to Add Account Screen')}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  balance: {
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 15,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: 'gray',
  },
  errorText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: 'red',
  }
});

