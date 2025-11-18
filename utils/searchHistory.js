// Search history management
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@search_history';
const MAX_HISTORY = 20;

export const saveSearch = async (departure, arrival, date) => {
  try {
    const history = await getSearchHistory();
    const newSearch = {
      id: Date.now().toString(),
      departure: typeof departure === 'string' ? departure : departure?.name || departure?.id,
      arrival: typeof arrival === 'string' ? arrival : arrival?.name || arrival?.id,
      date,
      timestamp: Date.now(),
    };
    
    // Remove duplicates and add to front
    const filtered = history.filter(
      s => !(s.departure === newSearch.departure && s.arrival === newSearch.arrival)
    );
    const updated = [newSearch, ...filtered].slice(0, MAX_HISTORY);
    
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('[searchHistory] Save error:', error);
    return [];
  }
};

export const getSearchHistory = async () => {
  try {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('[searchHistory] Get error:', error);
    return [];
  }
};

export const clearSearchHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('[searchHistory] Clear error:', error);
  }
};


