import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SelectedFlightsContext = createContext();

const SELECTED_KEY = '@selectedFlights';
const SAVED_KEY = '@saved_flights';

export const SelectedFlightsProvider = ({ children }) => {
  const [selectedFlights, setSelectedFlights] = useState([]); // up to 2 items
  const [savedFlights, setSavedFlights] = useState([]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [selJson, savedJson] = await Promise.all([
          AsyncStorage.getItem(SELECTED_KEY),
          AsyncStorage.getItem(SAVED_KEY),
        ]);
        if (selJson) setSelectedFlights(JSON.parse(selJson));
        if (savedJson) setSavedFlights(JSON.parse(savedJson));
      } catch (err) {
        console.error('[SelectedFlightsContext] load error:', err);
      }
    };
    loadAll();
  }, []);

  useEffect(() => {
    const persist = async () => {
      try {
        await AsyncStorage.setItem(SELECTED_KEY, JSON.stringify(selectedFlights));
      } catch (err) {
        console.error('[SelectedFlightsContext] save selected error:', err);
      }
    };
    persist();
  }, [selectedFlights]);

  useEffect(() => {
    const persist = async () => {
      try {
        await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(savedFlights));
      } catch (err) {
        console.error('[SelectedFlightsContext] save saved error:', err);
      }
    };
    persist();
  }, [savedFlights]);

  const toggleFlight = useCallback((flight) => {
    setSelectedFlights((prev) => {
      const exists = prev.some(f => f.id === flight.id);
      if (exists) {
        return prev.filter(f => f.id !== flight.id);
      } else {
        const next = [...prev, flight];
        if (next.length > 2) return next.slice(-2);
        return next;
      }
    });
  }, []);

  const clearSelected = useCallback(() => {
    setSelectedFlights([]);
  }, []);

  const saveFlight = useCallback(async (flight) => {
    setSavedFlights((prev) => {
      if (prev.some(f => f.id === flight.id)) return prev;
      return [...prev, flight];
    });
  }, []);

  const removeSavedFlight = useCallback((id) => {
    setSavedFlights((prev) => prev.filter(f => f.id !== id));
  }, []);

  return (
    <SelectedFlightsContext.Provider
      value={{
        selectedFlights,
        toggleFlight,
        clearSelected,
        savedFlights,
        saveFlight,
        removeSavedFlight,
      }}
    >
      {children}
    </SelectedFlightsContext.Provider>
  );
};

export const useSelectedFlights = () => useContext(SelectedFlightsContext);
