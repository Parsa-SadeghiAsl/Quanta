import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,

};

export default function SpendingChart({ data }) {
  const navigation = useNavigation();
  const topSpendingData = data.slice(0, 5);
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
          <Text style={styles.title}>Spending by Category</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Spendings')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
      </View>
      <View style={styles.cardItems}>
        {!data || data.length === 0 ? (
          <Text style={styles.emptyText}>No spending data for this period.</Text>
        ) : (
          <PieChart
            data={topSpendingData}
            width={screenWidth - 70}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="10"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    viewAll: { 
      color: '#3498db',
      fontSize: 14,
      paddingTop:5,
    },

    headerRow: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginBottom: 5
     },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  cardItems: {
    alignItems: 'center',

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
