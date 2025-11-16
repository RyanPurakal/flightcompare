import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useSelectedFlights } from '../state/SelectedFlightsContext';

export default function Compare() {
  const { selectedFlights } = useSelectedFlights();
  const flightA = selectedFlights[0] || null;
  const flightB = selectedFlights[1] || null;

  if (!flightA && !flightB) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No flights selected for comparison.</Text>
      </View>
    );
  }

  const metrics = [
    { label: 'Airline', key: 'title' },
    { label: 'Flight #', key: 'flight_number' },
    { label: 'Route', key: 'route' },
    { label: 'Duration', key: 'duration' },
    { label: 'Price', key: 'price', prefix: '$' },
    { label: 'Stops', key: 'status' },
    { label: 'Aircraft', key: 'aircraft' },
    { label: 'Seat', key: 'seat' },
    { label: 'Legroom', key: 'legroom' },
  ];

  const renderVal = (flight, key, prefix = '') => {
    if (!flight) return <Text style={styles.na}>N/A</Text>;
    if (key === 'title') {
      return (
        <View style={styles.airlineRow}>
          {flight.airlineLogo ? (
            <Image source={{ uri: flight.airlineLogo }} style={styles.logo} />
          ) : null}
          <Text style={styles.airlineText}>{flight.title}</Text>
        </View>
      );
    }
    if (key === 'price') {
      return <Text style={styles.price}>{prefix}{flight.price ?? 'N/A'}</Text>;
    }
    return <Text style={styles.value}>{flight[key] ?? 'N/A'}</Text>;
  };

  return (
    <ScrollView style={styles.container}>
      {metrics.map((m) => (
        <View key={m.key} style={styles.row}>
          <Text style={styles.metricLabel}>{m.label}</Text>
          <View style={styles.twoCols}>
            <View style={styles.col}>{renderVal(flightA, m.key, m.prefix)}</View>
            <View style={styles.col}>{renderVal(flightB, m.key, m.prefix)}</View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#aaa', fontSize: 16 },
  row: { marginBottom: 16, borderBottomWidth: 0.5, borderBottomColor: '#222', paddingBottom: 10 },
  metricLabel: { color: '#ddd', fontSize: 13, marginBottom: 8 },
  twoCols: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1, alignItems: 'center' },
  value: { color: '#fff', fontSize: 15, textAlign: 'center' },
  price: { color: '#4CAF50', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  na: { color: '#777', fontSize: 14 },
  airlineRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 48, height: 28, resizeMode: 'contain', marginRight: 8 },
  airlineText: { color: '#fff', fontWeight: '600' },
});
