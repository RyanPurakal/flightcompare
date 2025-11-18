import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, FlatList, ActivityIndicator, StyleSheet, Text, TouchableOpacity, 
  Modal, TextInput, ScrollView, RefreshControl, Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FlightCard from '../components/FlightCard';
import { fetchFlights } from '../services/api';
import { airports } from '../services/airports';
import { showError, showSuccess } from '../utils/toast';
import { getCached, setCached, getCacheKey } from '../utils/cache';
import { saveSearch, getSearchHistory } from '../utils/searchHistory';
import moment from 'moment';

const SORT_OPTIONS = {
  PRICE_LOW: 'price_low',
  PRICE_HIGH: 'price_high',
  DURATION: 'duration',
  STOPS: 'stops',
};

export default function Homepage({ navigation }) {
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [departure, setDeparture] = useState(null);
  const [arrival, setArrival] = useState(null);
  const [date, setDate] = useState(new Date());
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [returnDate, setReturnDate] = useState(new Date());
  const [passengers, setPassengers] = useState(1);

  // Filters and sorting
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.PRICE_LOW);
  const [maxPrice, setMaxPrice] = useState(null);
  const [directOnly, setDirectOnly] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState([]);

  // Airport modal
  const [airportModalVisible, setAirportModalVisible] = useState(false);
  const [selectingDeparture, setSelectingDeparture] = useState(true);
  const [airportSearchQuery, setAirportSearchQuery] = useState('');
  const [filteredAirports, setFilteredAirports] = useState(airports);

  // Search history
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // Filter airports based on search
  useEffect(() => {
    if (airportSearchQuery.trim() === '') {
      setFilteredAirports(airports);
    } else {
      const query = airportSearchQuery.toLowerCase();
      setFilteredAirports(
        airports.filter(
          airport =>
            airport.name.toLowerCase().includes(query) ||
            airport.id.toLowerCase().includes(query)
        )
      );
    }
  }, [airportSearchQuery]);

  // Load search history
  useEffect(() => {
    const loadHistory = async () => {
      const history = await getSearchHistory();
      setSearchHistory(history);
    };
    loadHistory();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...flights];

    // Apply filters
    if (maxPrice) {
      filtered = filtered.filter(f => f.price <= maxPrice);
    }
    if (directOnly) {
      filtered = filtered.filter(f => f.status === 'Direct');
    }
    if (selectedAirlines.length > 0) {
      filtered = filtered.filter(f => selectedAirlines.includes(f.title));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.PRICE_LOW:
          return a.price - b.price;
        case SORT_OPTIONS.PRICE_HIGH:
          return b.price - a.price;
        case SORT_OPTIONS.DURATION:
          // Simple duration comparison (would need parsing in production)
          return 0;
        case SORT_OPTIONS.STOPS:
          const aStops = a.status === 'Direct' ? 0 : parseInt(a.status) || 999;
          const bStops = b.status === 'Direct' ? 0 : parseInt(b.status) || 999;
          return aStops - bStops;
        default:
          return 0;
      }
    });

    setFilteredFlights(filtered);
  }, [flights, sortBy, maxPrice, directOnly, selectedAirlines]);

  const loadFlights = useCallback(async (useCache = true) => {
    if (!departure || !arrival) return;
    
    setError(null);
    const cacheKey = getCacheKey(departure.id, arrival.id, moment(date).format('YYYY-MM-DD'), page);
    
    if (useCache) {
      const cached = getCached(cacheKey);
      if (cached) {
        setFlights(cached);
        setHasMore(cached.length > 0);
        return;
      }
    }

    setLoading(true);
    try {
      const data = await fetchFlights({
        departure: departure.id,
        arrival: arrival.id,
        date: moment(date).format('YYYY-MM-DD'),
        page: 1,
      });

      if (data.length === 0) {
        setError('No flights found for this route and date.');
        showError('No flights found. Try different dates or airports.');
      } else {
        setFlights(data);
        setHasMore(data.length > 0);
        setCached(cacheKey, data);
        await saveSearch(departure, arrival, moment(date).format('YYYY-MM-DD'));
        showSuccess(`Found ${data.length} flights`);
      }
    } catch (err) {
      console.error('[Homepage] Load error:', err);
      setError('Failed to load flights. Please try again.');
      showError('Failed to load flights. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [departure, arrival, date, page]);

  const loadMoreFlights = async () => {
    if (loadingMore || !departure || !arrival || !hasMore) return;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const newData = await fetchFlights({
        departure: departure.id,
        arrival: arrival.id,
        date: moment(date).format('YYYY-MM-DD'),
        page: nextPage,
      });

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setFlights(prev => [...prev, ...newData]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('[Homepage] Load more error:', err);
      showError('Failed to load more flights.');
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFlights(false);
    setRefreshing(false);
  }, [loadFlights]);

  useEffect(() => {
    if (departure && arrival) loadFlights();
  }, [departure, arrival, date]);

  const openAirportModal = (isDeparture) => {
    setSelectingDeparture(isDeparture);
    setAirportSearchQuery('');
    setAirportModalVisible(true);
  };

  const selectAirport = (airport) => {
    if (selectingDeparture) setDeparture(airport);
    else setArrival(airport);
    setAirportModalVisible(false);
    setAirportSearchQuery('');
  };

  const useHistoryItem = async (historyItem) => {
    // Find airports from history
    const dep = airports.find(a => a.name.includes(historyItem.departure) || a.id === historyItem.departure);
    const arr = airports.find(a => a.name.includes(historyItem.arrival) || a.id === historyItem.arrival);
    if (dep) setDeparture(dep);
    if (arr) setArrival(arr);
    if (historyItem.date) setDate(new Date(historyItem.date));
    setShowHistory(false);
  };

  const getUniqueAirlines = () => {
    return [...new Set(flights.map(f => f.title))];
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

      {searchHistory.length > 0 && (
        <TouchableOpacity onPress={() => setShowHistory(!showHistory)} style={styles.historyButton}>
          <Text style={styles.historyButtonText}>
            {showHistory ? '▼ Hide' : '▲ Show'} Recent Searches ({searchHistory.length})
          </Text>
        </TouchableOpacity>
      )}

      {showHistory && searchHistory.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyContainer}>
          {searchHistory.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => useHistoryItem(item)}
              style={styles.historyItem}
            >
              <Text style={styles.historyItemText}>{item.departure} → {item.arrival}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.dateRow}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Departure</Text>
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(e, selectedDate) => selectedDate && setDate(selectedDate)}
            minimumDate={new Date()}
            textColor="#ffffff"
            themeVariant="dark"
          />
        </View>
        {isRoundTrip && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Return</Text>
            <DateTimePicker
              value={returnDate}
              mode="date"
              display="default"
              onChange={(e, selectedDate) => selectedDate && setReturnDate(selectedDate)}
              minimumDate={date}
              textColor="#ffffff"
              themeVariant="dark"
            />
          </View>
        )}
      </View>

      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={[styles.optionButton, isRoundTrip && styles.optionButtonActive]}
          onPress={() => setIsRoundTrip(!isRoundTrip)}
        >
          <Text style={styles.optionButtonText}>Round Trip</Text>
        </TouchableOpacity>
        <View style={styles.passengerContainer}>
          <Text style={styles.passengerLabel}>Passengers: </Text>
          <TouchableOpacity
            style={styles.passengerButton}
            onPress={() => setPassengers(Math.max(1, passengers - 1))}
          >
            <Text style={styles.passengerButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.passengerCount}>{passengers}</Text>
          <TouchableOpacity
            style={styles.passengerButton}
            onPress={() => setPassengers(Math.min(9, passengers + 1))}
          >
            <Text style={styles.passengerButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters and Sort */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, sortBy === SORT_OPTIONS.PRICE_LOW && styles.filterButtonActive]}
            onPress={() => setSortBy(SORT_OPTIONS.PRICE_LOW)}
          >
            <Text style={styles.filterButtonText}>Price ↑</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, sortBy === SORT_OPTIONS.PRICE_HIGH && styles.filterButtonActive]}
            onPress={() => setSortBy(SORT_OPTIONS.PRICE_HIGH)}
          >
            <Text style={styles.filterButtonText}>Price ↓</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, sortBy === SORT_OPTIONS.STOPS && styles.filterButtonActive]}
            onPress={() => setSortBy(SORT_OPTIONS.STOPS)}
          >
            <Text style={styles.filterButtonText}>Fewest Stops</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, directOnly && styles.filterButtonActive]}
            onPress={() => setDirectOnly(!directOnly)}
          >
            <Text style={styles.filterButtonText}>Direct Only</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadFlights(false)} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Loading flights...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFlights}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {error || 'No flights found. Try different dates or airports.'}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />
          }
        />
      )}

      <Modal visible={airportModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select {selectingDeparture ? 'Departure' : 'Arrival'} Airport
            </Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search airports..."
              placeholderTextColor="#888"
              value={airportSearchQuery}
              onChangeText={setAirportSearchQuery}
              autoFocus
            />
            <FlatList
              data={filteredAirports}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => selectAirport(item)} style={styles.airportItem}>
                  <Text style={styles.airportItemText}>{item.name} ({item.id})</Text>
                </TouchableOpacity>
              )}
              style={styles.airportList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAirportModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 10 },
  airportButtons: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  airportBtn: { backgroundColor: '#222', padding: 12, borderRadius: 8, flex: 0.48 },
  airportBtnText: { color: '#fff', textAlign: 'center', fontSize: 12 },
  historyButton: { backgroundColor: '#2a2a2a', padding: 8, borderRadius: 6, marginVertical: 5 },
  historyButtonText: { color: '#4CAF50', textAlign: 'center', fontSize: 12 },
  historyContainer: { maxHeight: 50, marginVertical: 5 },
  historyItem: { backgroundColor: '#2a2a2a', padding: 8, borderRadius: 6, marginRight: 8 },
  historyItemText: { color: '#fff', fontSize: 11 },
  dateRow: { flexDirection: 'row', marginVertical: 10 },
  dateContainer: { flex: 1, marginHorizontal: 5 },
  dateLabel: { color: '#ddd', fontSize: 12, marginBottom: 5 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  optionButton: { backgroundColor: '#222', padding: 10, borderRadius: 6, flex: 0.4 },
  optionButtonActive: { backgroundColor: '#4CAF50' },
  optionButtonText: { color: '#fff', textAlign: 'center', fontSize: 12 },
  passengerContainer: { flexDirection: 'row', alignItems: 'center', flex: 0.6 },
  passengerLabel: { color: '#ddd', fontSize: 12 },
  passengerButton: { backgroundColor: '#222', padding: 8, borderRadius: 4, marginHorizontal: 5 },
  passengerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  passengerCount: { color: '#fff', fontSize: 14, minWidth: 20, textAlign: 'center' },
  filtersContainer: { marginVertical: 10 },
  filterButton: { backgroundColor: '#222', padding: 8, borderRadius: 6, marginRight: 8 },
  filterButtonActive: { backgroundColor: '#4CAF50' },
  filterButtonText: { color: '#fff', fontSize: 12 },
  errorContainer: { backgroundColor: '#D32F2F', padding: 12, borderRadius: 8, marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorText: { color: '#fff', flex: 1 },
  retryButton: { backgroundColor: '#fff', padding: 6, borderRadius: 4 },
  retryButtonText: { color: '#D32F2F', fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#aaa', fontSize: 16, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#222', borderRadius: 10, padding: 15, maxHeight: '80%' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  searchInput: { backgroundColor: '#333', color: '#fff', padding: 10, borderRadius: 6, marginBottom: 10 },
  airportList: { maxHeight: 400 },
  airportItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  airportItemText: { color: '#fff', fontSize: 14 },
  closeButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 6, marginTop: 10 },
  closeButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
