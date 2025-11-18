import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelectedFlights } from '../state/SelectedFlightsContext';

export default function FlightCard({ item, onView }) {
  const { toggleFlight, selectedFlights } = useSelectedFlights();
  const isSelected = selectedFlights.some(f => f.id === item.id);
  const canAdd = selectedFlights.length < 2;

  const handleCompare = (e) => {
    e.stopPropagation();
    if (canAdd || isSelected) {
      toggleFlight(item);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onView(item)}>
      <View style={styles.header}>
        {item.airlineLogo ? <Image source={{ uri: item.airlineLogo }} style={styles.logo} /> : null}
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <Text style={styles.info}>Route: {item.route}</Text>
      <Text style={styles.info}>Duration: {item.duration}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>${item.price}</Text>
        <TouchableOpacity
          style={[styles.compareButton, isSelected && styles.compareButtonSelected, !canAdd && !isSelected && styles.compareButtonDisabled]}
          onPress={handleCompare}
          disabled={!canAdd && !isSelected}
        >
          <Text style={styles.compareButtonText}>
            {isSelected ? '✓ In Compare' : canAdd ? '+ Compare' : 'Full'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.info}>Stops: {item.status}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#2a2a2a', padding: 12, borderRadius: 8, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  logo: { width: 48, height: 28, resizeMode: 'contain', marginRight: 8 },
  title: { color: '#fff', fontWeight: '600', fontSize: 16 },
  info: { color: '#ddd', fontSize: 14, marginBottom: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  price: { color: '#4CAF50', fontSize: 16, fontWeight: 'bold' },
  compareButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  compareButtonSelected: {
    backgroundColor: '#81C784',
  },
  compareButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
