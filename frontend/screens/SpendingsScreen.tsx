import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { List, PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { useSpendingByCategory } from '../hooks/useApi';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
  },
};

const SpendingItem = ({ item, totalAmount }) => {
    const percentage = item.amount*100/totalAmount;
    return (
        <List.Item
        title={item.fullName|| 'Transaction'}
        description={`$${item.amount}`}
        right={() => (
            <Text style={styles.amountNegative}>
                    {(percentage > 1) ? percentage.toFixed(0): '>1'}%
            </Text>
            )}
            left={(props) =><View>

                 <View {...props} style={[styles.colorDot, { backgroundColor: item.color }]} />
            </View>
            }
            style={styles.item}
            />
        );
};
        
        
        
export default function TransactionsScreen({}) {
    const route = useRoute();
    const selectedYear = route.params?.year;
    const selectedMonth = route.params?.month;
    const { data, isLoading, isFetching, refetch, isError } = useSpendingByCategory(selectedYear, selectedMonth);
    
    let total :number = 0;
    if (data) {
      data.forEach(item => {
          total += item.amount;
      });
    }


        const onRefresh = useCallback(() => {
            refetch();
        }, [refetch]);
    
        if (isLoading) {
            return <ActivityIndicator animating={true} style={styles.loader} />;
        }
      
      if (isError) {
        return <Text style={styles.errorText}>Failed to load transactions.</Text>;
      }
    
      return (
        <PaperProvider theme={theme}>
          <View style={styles.container}>
            <FlatList
              data={data}
              renderItem={({ item }) => <SpendingItem item={item} totalAmount ={total} />}
              ListEmptyComponent={<Text style={styles.emptyText}>No Spending recorded for {selectedMonth}.</Text>}
              onRefresh={onRefresh}
              refreshing={isFetching}
            />
          </View>
        </PaperProvider>
      );
    }
    
    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: '#f5f5f5' },
        loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        item: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingLeft: 20 },
        amountPositive: { alignSelf: 'center', fontSize: 16, fontWeight: 'bold', marginRight: 15, color: 'green' },
        amountNegative: { alignSelf: 'center', fontSize: 16, fontWeight: 'bold', marginRight: 15, color: 'red' },
        fab: { position: 'absolute', margin: 16, right: 0, bottom: 15 },
        emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
        errorText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'red' },
        colorDot: {
            width: 30,
            height: 30,
            borderRadius: 15,
            marginLeft: 10,
        },
    });