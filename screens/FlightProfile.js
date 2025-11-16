import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelectedFlights } from '../state/SelectedFlightsContext';

export default function FlightProfile({ route }) {
  const flight = route?.params?.flight;
  const { savedFlights, saveFlight } = useSelectedFlights();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!flight) return;
    setIsSaved(savedFlights.some(f => f.id === flight.id));
  }, [flight, savedFlights]);

  const handleSave = async () => {
    if (!flight) return;
    if (isSaved) {
      Alert.alert('Already saved', 'This flight is already in your saved flights.');
      return;
    }
    await saveFlight(flight);
    Alert.alert('Saved', 'Flight added to saved flights.');
  };

  if (!flight) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No flight data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {flight.airlineLogo ? <Image source={{ uri: flight.airlineLogo }} style={styles.logo} /> : null}
        <Text style={styles.title}>{flight.title}</Text>
      </View>

      <Text style={styles.info}>Flight #: {flight.flight_number || 'N/A'}</Text>
      <Text style={styles.info}>Route: {flight.route}</Text>
      <Text style={styles.info}>Duration: {flight.duration || 'N/A'}</Text>
      <Text style={styles.info}>Status: {flight.status || 'N/A'}</Text>
      <Text style={styles.info}>Aircraft: {flight.aircraft || 'N/A'}</Text>
      <Text style={styles.info}>Seat: {flight.seat || 'N/A'}</Text>
      <Text style={styles.info}>Legroom: {flight.legroom || 'N/A'}</Text>
      <Text style={styles.price}>Price: ${flight.price ?? 'N/A'}</Text>

      <TouchableOpacity style={[styles.saveButton, isSaved && styles.saved]} onPress={handleSave} disabled={isSaved}>
        <Text style={styles.saveText}>{isSaved ? 'Saved' : 'Save Flight'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logo: { width: 60, height: 40, resizeMode: 'contain', marginRight: 10 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  info: { color: '#ddd', fontSize: 16, marginBottom: 6 },
  price: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  saved: { backgroundColor: '#aaa' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  error: { color: 'red', fontSize: 18 },
});
