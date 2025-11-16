import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function FlightCard({ item, onView }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onView(item)}>
      <View style={styles.header}>
        {item.airlineLogo ? <Image source={{ uri: item.airlineLogo }} style={styles.logo} /> : null}
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <Text style={styles.info}>Route: {item.route}</Text>
      <Text style={styles.info}>Duration: {item.duration}</Text>
      <Text style={styles.price}>${item.price}</Text>
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
  price: { color: '#4CAF50', fontSize: 16, fontWeight: 'bold' },
});
