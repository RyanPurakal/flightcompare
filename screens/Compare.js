import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelectedFlights } from '../state/SelectedFlightsContext';
import { analyzeFlights } from '../services/genai';

export default function Compare() {
  const { selectedFlights } = useSelectedFlights();
  const flightA = selectedFlights[0] || null;
  const flightB = selectedFlights[1] || null;
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  if (!flightA && !flightB) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No flights selected for comparison.</Text>
      </View>
    );
  }

  const handleAIAnalysis = async () => {
    if (!flightA || !flightB) return;
    
    setLoadingAI(true);
    setAiAnalysis(null);
    
    try {
      const analysis = await analyzeFlights(flightA, flightB);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('[Compare] Error getting AI analysis:', error);
      setAiAnalysis('Failed to generate AI analysis. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  };

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

  const getWinner = (key) => {
    if (!flightA || !flightB) return null;
    
    if (key === 'price') {
      return flightA.price < flightB.price ? 'A' : flightB.price < flightA.price ? 'B' : null;
    }
    if (key === 'status') {
      const aStops = flightA.status === 'Direct' ? 0 : parseInt(flightA.status) || 999;
      const bStops = flightB.status === 'Direct' ? 0 : parseInt(flightB.status) || 999;
      return aStops < bStops ? 'A' : bStops < aStops ? 'B' : null;
    }
    return null;
  };

  const getPriceDifference = () => {
    if (!flightA || !flightB) return null;
    const diff = Math.abs(flightA.price - flightB.price);
    if (diff === 0) return null;
    return flightA.price < flightB.price 
      ? `$${diff} cheaper` 
      : `$${diff} more expensive`;
  };

  const renderVal = (flight, key, prefix = '', isFlightA = false) => {
    if (!flight) return <Text style={styles.na}>N/A</Text>;
    const winner = getWinner(key);
    const isWinner = winner === (isFlightA ? 'A' : 'B');
    
    if (key === 'title') {
      return (
        <View style={styles.airlineRow}>
          {flight.airlineLogo ? (
            <Image source={{ uri: flight.airlineLogo }} style={styles.logo} />
          ) : null}
          <Text style={styles.airlineText}>{flight.title}</Text>
          {isWinner && <Text style={styles.winnerBadge}>✓ Best</Text>}
        </View>
      );
    }
    if (key === 'price') {
      const priceDiff = isFlightA && getPriceDifference();
      return (
        <View>
          <Text style={[styles.price, isWinner && styles.winnerText]}>
            {prefix}{flight.price ?? 'N/A'}
          </Text>
          {priceDiff && <Text style={styles.priceDiff}>{priceDiff}</Text>}
        </View>
      );
    }
    return (
      <View style={styles.valueContainer}>
        <Text style={[styles.value, isWinner && styles.winnerText]}>
          {flight[key] ?? 'N/A'}
        </Text>
        {isWinner && <Text style={styles.winnerBadge}>Best</Text>}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {flightA && flightB && (
        <View style={styles.aiSection}>
          <TouchableOpacity 
            style={[styles.aiButton, loadingAI && styles.aiButtonDisabled]} 
            onPress={handleAIAnalysis}
            disabled={loadingAI}
          >
            {loadingAI ? (
              <View style={styles.aiButtonContent}>
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.aiButtonText}>Analyzing</Text>
              </View>
            ) : (
              <Text style={styles.aiButtonText}>Get AI Comparison</Text>
            )}
          </TouchableOpacity>
          
          {aiAnalysis && (
            <View style={styles.aiAnalysisBox}>
              <Text style={styles.aiAnalysisTitle}>AI Recommendation:</Text>
              <Text style={styles.aiAnalysisText}>{aiAnalysis}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Quick Summary</Text>
        <Text style={styles.summaryText}>
          {flightA && flightB && (
            <>
              {flightA.price < flightB.price ? 'Flight A' : 'Flight B'} is cheaper by ${Math.abs(flightA.price - flightB.price)}
              {'\n'}
              {flightA.status === 'Direct' && flightB.status !== 'Direct' ? 'Flight A' : 
               flightB.status === 'Direct' && flightA.status !== 'Direct' ? 'Flight B' : 
               'Both flights'} {flightA.status === 'Direct' || flightB.status === 'Direct' ? 'has' : 'have'} direct option
            </>
          )}
        </Text>
      </View>

      {metrics.map((m) => (
        <View key={m.key} style={styles.row}>
          <Text style={styles.metricLabel}>{m.label}</Text>
          <View style={styles.twoCols}>
            <View style={[styles.col, getWinner(m.key) === 'A' && styles.winnerCol]}>
              {renderVal(flightA, m.key, m.prefix, true)}
            </View>
            <View style={[styles.col, getWinner(m.key) === 'B' && styles.winnerCol]}>
              {renderVal(flightB, m.key, m.prefix, false)}
            </View>
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
  aiSection: { marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  aiButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  aiButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  aiButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aiAnalysisBox: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  aiAnalysisTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aiAnalysisText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  summaryBox: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  summaryTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  row: { marginBottom: 16, borderBottomWidth: 0.5, borderBottomColor: '#222', paddingBottom: 10 },
  metricLabel: { color: '#ddd', fontSize: 13, marginBottom: 8, fontWeight: '600' },
  twoCols: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1, alignItems: 'center', padding: 8, borderRadius: 6 },
  winnerCol: { backgroundColor: '#1a3a1a', borderWidth: 1, borderColor: '#4CAF50' },
  valueContainer: { alignItems: 'center' },
  value: { color: '#fff', fontSize: 15, textAlign: 'center' },
  winnerText: { color: '#4CAF50', fontWeight: 'bold' },
  winnerBadge: { color: '#4CAF50', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  price: { color: '#4CAF50', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  priceDiff: { color: '#81C784', fontSize: 11, textAlign: 'center', marginTop: 2 },
  na: { color: '#777', fontSize: 14 },
  airlineRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  logo: { width: 48, height: 28, resizeMode: 'contain', marginRight: 8 },
  airlineText: { color: '#fff', fontWeight: '600' },
});
