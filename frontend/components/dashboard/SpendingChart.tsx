import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,

};

export default function SpendingChart({ data }) {
  // selecting top 5 data with most spending
  const topSpendingData = data.slice(0, 5);
  // add dollar sign for amount in legend:
  topSpendingData.forEach((item) => {
    item.legend = `$${item.amount.toFixed(2)} - ${item.name}`;
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Spending by Category</Text>
      {!data || data.length === 0 ? (
        <Text style={styles.emptyText}>No spending data for this period.</Text>
      ) : (
        <PieChart
          data={topSpendingData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="10"
           // Renders the actual values, not percentages
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  emptyText: {
    color: '#7f8c8d',
    paddingVertical: 20,
  },
});
