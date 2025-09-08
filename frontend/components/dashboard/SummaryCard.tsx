// src/components/dashboard/SummaryCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  title: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
};

export default function SummaryCard({ title, value, positive, negative }: Props) {
  const valueColor = positive ? '#2ecc71' : negative ? '#e74c3c' : '#2c3e50';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});