import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelectedFlights } from '../state/SelectedFlightsContext';

export default function History({ navigation }) {
  const { savedFlights, removeSavedFlight, toggleFlight } = useSelectedFlights();

  const moveToCompare = (flight) => {
    toggleFlight(flight);
    Alert.alert('Moved to Compare', `${flight.title} added to Compare tab.`);
  };

  if (!savedFlights || savedFlights.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No saved flights yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savedFlights}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
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
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 10 },
  empty: { color: '#aaa', fontSize: 16, textAlign: 'center', marginTop: 20 },
  card: { backgroundColor: '#2a2a2a', padding: 12, borderRadius: 8, marginBottom: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  info: { color: '#ddd', fontSize: 14, marginBottom: 2 },
  price: { color: '#4CAF50', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  buttons: { flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' },
  button: { backgroundColor: '#4CAF50', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  delete: { backgroundColor: '#D32F2F' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
