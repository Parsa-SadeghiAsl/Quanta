// src/components/dashboard/RecentTransactions.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const transactionsData = [
  { id: '1', category: 'Groceries', note: 'SuperMart', amount: -45.50, date: 'Sep 07' },
  { id: '2', category: 'Income', note: 'Paycheck', amount: 2250.00, date: 'Sep 05' },
  { id: '3', category: 'Rent', note: 'Rent Payment', amount: -1200.00, date: 'Sep 01' },
];

const TransactionItem = ({ item }) => (
  <View style={styles.itemContainer}>
    <View>
      <Text style={styles.itemNote}>{item.note}</Text>
      <Text style={styles.itemDate}>{item.date}</Text>
    </View>
    <Text style={item.amount > 0 ? styles.itemAmountPositive : styles.itemAmountNegative}>
      {item.amount > 0 ? `+$${item.amount.toFixed(2)}` : `-$${Math.abs(item.amount).toFixed(2)}`}
    </Text>
  </View>
);

export default function RecentTransactions() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent Transactions</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={transactionsData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 20, padding: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 16, fontWeight: 'bold' },
  viewAll: { color: '#3498db', fontSize: 14 },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  itemNote: { fontSize: 16 },
  itemDate: { fontSize: 12, color: '#7f8c8d' },
  itemAmountPositive: { fontSize: 16, color: '#2ecc71', fontWeight: 'bold' },
  itemAmountNegative: { fontSize: 16, color: '#e74c3c', fontWeight: 'bold' },
});