// Price alert management
import AsyncStorage from '@react-native-async-storage/async-storage';

const ALERTS_KEY = '@price_alerts';

export const savePriceAlert = async (flight, targetPrice) => {
  try {
    const alerts = await getPriceAlerts();
    const newAlert = {
      id: Date.now().toString(),
      flightId: flight.id,
      flight: flight,
      targetPrice,
      currentPrice: flight.price,
      createdAt: Date.now(),
      notified: false,
    };
    
    const updated = [...alerts, newAlert];
    await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('[priceAlerts] Save error:', error);
    return [];
  }
};

export const getPriceAlerts = async () => {
  try {
    const json = await AsyncStorage.getItem(ALERTS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('[priceAlerts] Get error:', error);
    return [];
  }
};

export const removePriceAlert = async (alertId) => {
  try {
    const alerts = await getPriceAlerts();
    const updated = alerts.filter(a => a.id !== alertId);
    await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('[priceAlerts] Remove error:', error);
    return [];
  }
};

export const checkPriceAlerts = async (flightId, currentPrice) => {
  try {
    const alerts = await getPriceAlerts();
    const relevantAlerts = alerts.filter(
      a => a.flightId === flightId && !a.notified && currentPrice <= a.targetPrice
    );
    return relevantAlerts;
  } catch (error) {
    console.error('[priceAlerts] Check error:', error);
    return [];
  }
};


