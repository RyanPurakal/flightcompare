import { RAPIDAPIKEY } from '@env';
import { getCached, setCached, getCacheKey } from '../utils/cache';

const BASE_URL = 'https://google-flights2.p.rapidapi.com/api/v1/searchFlights';
const RAPIDAPI_KEY = RAPIDAPIKEY;

export const fetchFlights = async ({
  departure,
  arrival,
  date = new Date().toISOString().split('T')[0],
  page = 1,
  useCache = true,
} = {}) => {
  if (!departure || !arrival) return [];
  
  if (useCache) {
    const cacheKey = getCacheKey(departure, arrival, date, page);
    const cached = getCached(cacheKey);
    if (cached) {
      console.log('[api] Using cached data');
      return cached;
    }
  }

  try {
    const url = `${BASE_URL}?departure_id=${departure}&arrival_id=${arrival}&outbound_date=${date}&travel_class=ECONOMY&adults=1&show_hidden=0&currency=USD&language_code=en-US&country_code=US&search_type=best&page=${page}`;
    console.log('[api] Fetching:', url);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'google-flights2.p.rapidapi.com',
      },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const json = await res.json();
    if (!json.status || !json.data?.itineraries?.topFlights) return [];

    const flights = json.data.itineraries.topFlights.map((f, i) => {
      const flight = f.flights?.[0] || {};
      return {
        id: `${flight.flight_number || 'unknown'}-${i}`,
        title: flight.airline || 'Unknown Airline',
        route: `${flight.departure_airport?.airport_code || ''} → ${flight.arrival_airport?.airport_code || ''}`,
        duration: f.duration?.text || flight.duration?.text || '',
        price: f.price || 0,
        airlineLogo: flight.airline_logo || '',
        status: f.stops === 0 ? 'Direct' : `${f.stops} Stop`,
        flight_number: flight.flight_number || '',
        aircraft: flight.aircraft || '',
        seat: flight.seat || '',
        legroom: flight.legroom || '',
        extensions: flight.extensions || [],
        departure_time: flight.departure_time || null,
        arrival_time: flight.arrival_time || null,
        terminal: flight.terminal || null,
        gate: flight.gate || null,
      };
    });

    // Cache the results
    if (useCache) {
      const cacheKey = getCacheKey(departure, arrival, date, page);
      setCached(cacheKey, flights);
    }

    return flights;
  } catch (err) {
    console.error('[api] Fetch error:', err);
    throw err; // Re-throw for error handling in components
  }
};
