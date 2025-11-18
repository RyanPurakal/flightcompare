import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, TextInput, ScrollView, Share } from 'react-native';
import { useSelectedFlights } from '../state/SelectedFlightsContext';
import { savePriceAlert, getPriceAlerts } from '../utils/priceAlerts';
import { showSuccess, showError } from '../utils/toast';

export default function FlightProfile({ route }) {
  const flight = route?.params?.flight;
  const { savedFlights, saveFlight, toggleFlight } = useSelectedFlights();
  const [isSaved, setIsSaved] = useState(false);
  const [priceAlert, setPriceAlert] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [showPriceAlertInput, setShowPriceAlertInput] = useState(false);

  useEffect(() => {
    if (!flight) return;
    setIsSaved(savedFlights.some(f => f.id === flight.id));
    loadPriceAlerts();
  }, [flight, savedFlights]);

  const loadPriceAlerts = async () => {
    const alerts = await getPriceAlerts();
    const alert = alerts.find(a => a.flightId === flight?.id);
    setPriceAlert(alert);
  };

  const handleSave = async () => {
    if (!flight) return;
    if (isSaved) {
      Alert.alert('Already saved', 'This flight is already in your saved flights.');
      return;
    }
    await saveFlight(flight);
    showSuccess('Flight saved to favorites');
  };

  const handleCompare = () => {
    if (!flight) return;
    toggleFlight(flight);
    showSuccess('Comparison list updated');
  };

  const handleShare = async () => {
    if (!flight) return;
    try {
      await Share.share({
        message: `Flight: ${flight.title}\nRoute: ${flight.route}\nDuration: ${flight.duration}\nPrice: $${flight.price}\nStops: ${flight.status}`,
      });
    } catch (error) {
      showError('Failed to share flight');
    }
  };

  const handleSetPriceAlert = async () => {
    if (!flight || !targetPrice) return;
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      showError('Please enter a valid price');
      return;
    }
    await savePriceAlert(flight, price);
    setShowPriceAlertInput(false);
    setTargetPrice('');
    await loadPriceAlerts();
    showSuccess(`Price alert set for $${price}`);
  };

  if (!flight) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No flight data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {flight.airlineLogo ? <Image source={{ uri: flight.airlineLogo }} style={styles.logo} /> : null}
        <Text style={styles.title}>{flight.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flight Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Flight #:</Text>
          <Text style={styles.detailValue}>{flight.flight_number || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Route:</Text>
          <Text style={styles.detailValue}>{flight.route}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>{flight.duration || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Stops:</Text>
          <Text style={styles.detailValue}>{flight.status || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Aircraft:</Text>
          <Text style={styles.detailValue}>{flight.aircraft || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Seat:</Text>
          <Text style={styles.detailValue}>{flight.seat || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Legroom:</Text>
          <Text style={styles.detailValue}>{flight.legroom || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.priceLabel}>Price</Text>
        <Text style={styles.price}>${flight.price ?? 'N/A'}</Text>
      </View>

      {priceAlert && (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>💰 Price Alert Active</Text>
          <Text style={styles.alertSubtext}>Notify when price drops to ${priceAlert.targetPrice}</Text>
        </View>
      )}

      {showPriceAlertInput && (
        <View style={styles.alertInputBox}>
          <Text style={styles.alertInputLabel}>Set target price:</Text>
          <TextInput
            style={styles.alertInput}
            placeholder="Enter target price"
            placeholderTextColor="#888"
            value={targetPrice}
            onChangeText={setTargetPrice}
            keyboardType="numeric"
          />
          <View style={styles.alertInputButtons}>
            <TouchableOpacity style={styles.alertInputButton} onPress={handleSetPriceAlert}>
              <Text style={styles.alertInputButtonText}>Set Alert</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.alertInputButton, styles.alertInputButtonCancel]}
              onPress={() => {
                setShowPriceAlertInput(false);
                setTargetPrice('');
              }}
            >
              <Text style={styles.alertInputButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCompare}>
          <Text style={styles.actionButtonText}>Add to Compare</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, isSaved && styles.actionButtonSaved]}
          onPress={handleSave}
          disabled={isSaved}
        >
          <Text style={styles.actionButtonText}>{isSaved ? '✓ Saved' : 'Save Flight'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => setShowPriceAlertInput(!showPriceAlertInput)}
        >
          <Text style={styles.actionButtonText}>💰 Price Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={handleShare}
        >
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logo: { width: 60, height: 40, resizeMode: 'contain', marginRight: 10 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  section: { marginBottom: 20 },
  sectionTitle: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  detailLabel: { color: '#aaa', fontSize: 14 },
  detailValue: { color: '#fff', fontSize: 14, fontWeight: '500' },
  priceSection: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  priceLabel: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  price: { color: '#4CAF50', fontSize: 32, fontWeight: 'bold' },
  alertBox: { backgroundColor: '#1a3a1a', padding: 12, borderRadius: 8, marginBottom: 15, borderLeftWidth: 3, borderLeftColor: '#4CAF50' },
  alertText: { color: '#4CAF50', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  alertSubtext: { color: '#fff', fontSize: 12 },
  alertInputBox: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 8, marginBottom: 15 },
  alertInputLabel: { color: '#fff', fontSize: 14, marginBottom: 8 },
  alertInput: { backgroundColor: '#222', color: '#fff', padding: 12, borderRadius: 6, marginBottom: 12 },
  alertInputButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  alertInputButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 6, flex: 0.48 },
  alertInputButtonCancel: { backgroundColor: '#666' },
  alertInputButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  actionsContainer: { marginTop: 10 },
  actionButton: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  actionButtonSaved: { backgroundColor: '#81C784' },
  actionButtonSecondary: { backgroundColor: '#2a2a2a', borderWidth: 1, borderColor: '#4CAF50' },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  error: { color: 'red', fontSize: 18 },
});
