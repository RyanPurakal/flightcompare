import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useSelectedFlights } from '../state/SelectedFlightsContext';
import { showSuccess } from '../utils/toast';
import moment from 'moment';

const GROUP_BY_OPTIONS = {
  NONE: 'none',
  ROUTE: 'route',
  PRICE: 'price',
  DATE: 'date',
};

export default function History({ navigation }) {
  const { savedFlights, removeSavedFlight, toggleFlight } = useSelectedFlights();
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState(GROUP_BY_OPTIONS.NONE);
  const [sortBy, setSortBy] = useState('price');

  const moveToCompare = (flight) => {
    toggleFlight(flight);
    showSuccess('Flight added to comparison');
  };

  const filteredAndSortedFlights = useMemo(() => {
    let filtered = [...savedFlights];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        f =>
          f.title?.toLowerCase().includes(query) ||
          f.route?.toLowerCase().includes(query) ||
          f.flight_number?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'route') return a.route.localeCompare(b.route);
      return 0;
    });

    return filtered;
  }, [savedFlights, searchQuery, sortBy]);

  const groupedFlights = useMemo(() => {
    if (groupBy === GROUP_BY_OPTIONS.NONE) {
      return { 'All Flights': filteredAndSortedFlights };
    }

    const groups = {};
    filteredAndSortedFlights.forEach(flight => {
      let key;
      if (groupBy === GROUP_BY_OPTIONS.ROUTE) {
        key = flight.route || 'Unknown Route';
      } else if (groupBy === GROUP_BY_OPTIONS.PRICE) {
        const priceRange = flight.price < 200 ? 'Under $200' :
                          flight.price < 500 ? '$200-$500' :
                          flight.price < 1000 ? '$500-$1000' : 'Over $1000';
        key = priceRange;
      } else {
        key = 'All Flights';
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(flight);
    });

    return groups;
  }, [filteredAndSortedFlights, groupBy]);

  if (!savedFlights || savedFlights.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No saved flights yet.</Text>
        <Text style={styles.emptySubtext}>Save flights from the Flights tab to see them here.</Text>
      </View>
    );
  }

  const renderFlightCard = (item) => (
    <View style={styles.card} key={item.id}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.info}>Route: {item.route}</Text>
      <Text style={styles.info}>Duration: {item.duration}</Text>
      <Text style={styles.price}>${item.price ?? 'N/A'}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => moveToCompare(item)}>
          <Text style={styles.buttonText}>Compare</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.delete]} onPress={() => removeSavedFlight(item.id)}>
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search saved flights..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersSection}>
        <Text style={styles.filterSectionTitle}>Group By:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.filterChip, groupBy === GROUP_BY_OPTIONS.NONE && styles.filterChipActive]}
            onPress={() => setGroupBy(GROUP_BY_OPTIONS.NONE)}
          >
            <Text style={styles.filterChipText}>All Flights</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, groupBy === GROUP_BY_OPTIONS.ROUTE && styles.filterChipActive]}
            onPress={() => setGroupBy(GROUP_BY_OPTIONS.ROUTE)}
          >
            <Text style={styles.filterChipText}>Route</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, groupBy === GROUP_BY_OPTIONS.PRICE && styles.filterChipActive]}
            onPress={() => setGroupBy(GROUP_BY_OPTIONS.PRICE)}
          >
            <Text style={styles.filterChipText}>Price Range</Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={styles.filterSectionTitle}>Sort By:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'price' && styles.filterChipActive]}
            onPress={() => setSortBy('price')}
          >
            <Text style={styles.filterChipText}>Price (Low to High)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'route' && styles.filterChipActive]}
            onPress={() => setSortBy('route')}
          >
            <Text style={styles.filterChipText}>Route (A-Z)</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={Object.keys(groupedFlights)}
        keyExtractor={(key) => key}
        renderItem={({ item: groupKey }) => (
          <View>
            {groupBy !== GROUP_BY_OPTIONS.NONE && (
              <Text style={styles.groupHeader}>{groupKey} ({groupedFlights[groupKey].length})</Text>
            )}
            {groupedFlights[groupKey].map(flight => renderFlightCard(flight))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No flights match your search.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 10 },
  searchContainer: { marginBottom: 10 },
  searchInput: { backgroundColor: '#222', color: '#fff', padding: 12, borderRadius: 8 },
  filtersSection: { marginBottom: 15 },
  filterSectionTitle: { color: '#4CAF50', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  filtersRow: { marginBottom: 10 },
  filterChip: { backgroundColor: '#222', padding: 8, borderRadius: 16, marginRight: 8 },
  filterChipActive: { backgroundColor: '#4CAF50' },
  filterChipText: { color: '#fff', fontSize: 12 },
  groupHeader: { color: '#4CAF50', fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 8 },
  empty: { color: '#aaa', fontSize: 16, textAlign: 'center', marginTop: 20 },
  emptySubtext: { color: '#777', fontSize: 14, textAlign: 'center', marginTop: 8 },
  emptyContainer: { paddingVertical: 40 },
  card: { backgroundColor: '#2a2a2a', padding: 12, borderRadius: 8, marginBottom: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  info: { color: '#ddd', fontSize: 14, marginBottom: 2 },
  price: { color: '#4CAF50', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  buttons: { flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' },
  button: { backgroundColor: '#4CAF50', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  delete: { backgroundColor: '#D32F2F' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
