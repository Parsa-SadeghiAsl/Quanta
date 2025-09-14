// src/components/dashboard/RecentTransactions.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { RootStackParamList } from '../../navigation/AppNavigator';


type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;


const TransactionItem = ({ item }) => {
  const isIncome = item.category_type === 'income';
  const amountStyle = isIncome ? styles.itemAmountPositive : styles.itemAmountNegative;
  const amountPrefix = isIncome ? '+' : '-';
  
  const formattedDate = format(new Date(item.date), 'MMM dd');

  return (
    <View style={styles.itemContainer}>
      <View>
        <Text style={styles.itemNote}>{item.notes || item.category_name || 'Transaction'}</Text>
        <Text style={styles.itemDate}>{formattedDate}</Text>
      </View>
      <Text style={amountStyle}>
        {`${amountPrefix}$${parseFloat(item.amount).toFixed(2)}`}
      </Text>
    </View>
  );
};


export default function RecentTransactions({ data }) {
  const navigation = useNavigation();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data} 
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TransactionItem item={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No recent transactions found.</Text>}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    marginHorizontal: 20, 
    marginBottom: 20, 
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, 
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 16, fontWeight: 'bold' },
  viewAll: { color: '#3498db', fontSize: 14 },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#ecf0f1' },
  itemNote: { fontSize: 16, fontWeight: '500' },
  itemDate: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  itemAmountPositive: { fontSize: 16, color: '#2ecc71', fontWeight: 'bold' },
  itemAmountNegative: { fontSize: 16, color: '#e74c3c', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', padding: 20, color: 'gray' },
});
