import React, { useCallback, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { List, FAB, PaperProvider } from 'react-native-paper';
import { useAllTransactions } from '../hooks/useApi';
import { useNavigation } from '@react-navigation/native';

const TransactionItem = ({ item }) => {
	const amount = parseFloat(item.amount);
	const isIncome = item.category_type === 'income';
	return (
		<List.Item
			title={item.notes || item.category_name || 'Transaction'}
			description={new Date(item.date).toLocaleDateString()}
			right={() => (
				<Text style={isIncome ? styles.amountPositive : styles.amountNegative}>
					{isIncome ? '+' : '-'}${Math.abs(amount).toFixed(2)}
				</Text>
			)}
			left={() => <List.Icon icon={isIncome ? 'arrow-up-bold-circle' : 'arrow-down-bold-circle'} />}
			style={styles.item}
		/>
	);
};

export default function TransactionsScreen() {
	const navigation = useNavigation();
	const { data: transactions, isLoading, isError, isFetching, refetch } = useAllTransactions();

	const [isFabVisible, setIsFabVisible] = useState(true);
	const lastScrollY = useRef(0);
	const handleScroll = useCallback((event) => {
		const currentScrollY = event.nativeEvent.contentOffset.y;
		const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
		const scrollThreshold = 10; // A small buffer

		if (scrollDirection === 'down' && currentScrollY > scrollThreshold && isFabVisible) {
			setIsFabVisible(false);
		} else if (scrollDirection === 'up' && !isFabVisible) {
			setIsFabVisible(true);
		}

		lastScrollY.current = currentScrollY;
	}, [isFabVisible]);

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
			<View style={styles.container}>
				<FlatList
					data={transactions}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item }) => <TransactionItem item={item} />}
					ListEmptyComponent={<Text style={styles.emptyText}>No transactions recorded yet.</Text>}
					onRefresh={onRefresh}
					refreshing={isFetching}
					// 5. Optimize how often scroll events are sent (in ms).
					onScroll={handleScroll}
					scrollEventThrottle={16}
				/>
				<FAB
					icon="plus"
					style={styles.fab}
					onPress={() => navigation.navigate('AddTransaction')}
					visible={isFabVisible}
				/>
			</View>
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
	errorText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'red' }
});

