import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressBar = ({ spent, total }) => {
  const progress = total > 0 ? (spent / total) * 100 : 0;
  return (
    <View style={styles.progressBarBackground}>
      <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
    </View>
  );
};

export default function BudgetProgress({ data }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Budget Progress</Text>
      {!data || data.length === 0 ? (
         <Text style={styles.emptyText}>You have no active budgets.</Text>
      ) : (
        data.map((item, index) => (
          <View key={index} style={styles.budgetItem}>
            <View style={styles.budgetTextContainer}>
              <Text style={styles.categoryText}>{item.category_details.name}</Text>
              <Text style={styles.amountText}>${item.spent} of ${item.amount}</Text>
            </View>
            <ProgressBar spent={item.spent} total={item.amount} />
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 20, padding: 15 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  budgetItem: { marginBottom: 15 },
  budgetTextContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  categoryText: { fontSize: 14 },
  amountText: { fontSize: 14, color: '#7f8c8d' },
  progressBarBackground: { height: 10, backgroundColor: '#ecf0f1', borderRadius: 5, width: '100%' },
  progressBarFill: { height: 10, backgroundColor: '#3498db', borderRadius: 5 },
  emptyText: { color: '#7f8c8d', textAlign: 'center', paddingVertical: 20 },
});
