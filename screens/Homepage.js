import React, { useState, useEffect } from 'react';
import { 
  View, FlatList, ActivityIndicator, StyleSheet, Text, TouchableOpacity, Modal, Button 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FlightCard from '../components/FlightCard';
import { fetchFlights } from '../services/api';
import { airports } from '../services/airports';
import moment from 'moment';

export default function Homepage({ navigation }) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [departure, setDeparture] = useState(null);
  const [arrival, setArrival] = useState(null);
  const [date, setDate] = useState(new Date());

  const [airportModalVisible, setAirportModalVisible] = useState(false);
  const [selectingDeparture, setSelectingDeparture] = useState(true);

  const loadFlights = async () => {
    if (!departure || !arrival) return;
    setLoading(true);
    setPage(1);
    setHasMore(true);

    const data = await fetchFlights({
      departure: departure.id,
      arrival: arrival.id,
      date: moment(date).format('YYYY-MM-DD'),
      page: 1,
    });

    setFlights(data);
    setHasMore(data.length > 0);
    setLoading(false);
  };

  const loadMoreFlights = async () => {
    if (loadingMore || !departure || !arrival || !hasMore) return;
    setLoadingMore(true);

    const nextPage = page + 1;
    const newData = await fetchFlights({
      departure: departure.id,
      arrival: arrival.id,
      date: moment(date).format('YYYY-MM-DD'),
      page: nextPage,
    });

    if (newData.length === 0) setHasMore(false);
    else {
      setFlights(prev => [...prev, ...newData]);
      setPage(nextPage);
    }

    setLoadingMore(false);
  };

  useEffect(() => {
    if (departure && arrival) loadFlights();
  }, [departure, arrival, date]);

  const openAirportModal = (isDeparture) => {
    setSelectingDeparture(isDeparture);
    setAirportModalVisible(true);
  };

  const selectAirport = (airport) => {
    if (selectingDeparture) setDeparture(airport);
    else setArrival(airport);
    setAirportModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.airportButtons}>
        <TouchableOpacity onPress={() => openAirportModal(true)} style={styles.airportBtn}>
          <Text style={styles.airportBtnText}>
            {departure ? `${departure.name} (${departure.id})` : 'Select Departure'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openAirportModal(false)} style={styles.airportBtn}>
          <Text style={styles.airportBtnText}>
            {arrival ? `${arrival.name} (${arrival.id})` : 'Select Arrival'}
          </Text>
        </TouchableOpacity>
      </View>

      <DateTimePicker
        value={date}
        mode="date"
        display="default"
        onChange={(e, selectedDate) => selectedDate && setDate(selectedDate)}
        style={{ marginVertical: 10 }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Loading flights...</Text>
        </View>
      ) : (
        <FlatList
          data={flights}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <FlightCard 
              item={item} 
              onView={f => navigation.navigate('FlightProfile', { flight: f })}
            />
          )}
          onEndReached={loadMoreFlights}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore && <ActivityIndicator size="small" color="#4CAF50" />}
        />
      )}

      <Modal visible={airportModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={airports}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => selectAirport(item)} style={styles.airportItem}>
                  <Text style={{ color: '#fff' }}>{item.name} ({item.id})</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Close" onPress={() => setAirportModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 10 },
  airportButtons: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
  airportBtn: { backgroundColor: '#222', padding: 12, borderRadius: 8, flex: 0.48 },
  airportBtnText: { color: '#fff', textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#222', borderRadius: 10, padding: 15, maxHeight: '80%' },
  airportItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
});
