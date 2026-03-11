# FlightCompare

A React Native / Expo app for searching, comparing, and saving flights. Compare up to two flights side-by-side with AI-powered recommendations using the Google Gemini API.

## Features

- **Flight Search** — Search flights by departure/arrival airports and date
- **Compare Flights** — Add flights to compare and view side-by-side with visual highlights
- **AI Comparison** — Get Gemini AI recommendations on which flight is better
- **Favorites** — Save flights for later, with search and organization options
- **Search Filters** — Sort by price or stops, filter direct flights only
- **Search History** — Quick re-search from recent routes
- **Price Alerts** — Set target prices and get notified when flights drop
- **Share** — Share flight details via your device's share sheet

## Tech Stack

- **React Native** with **Expo**
- **React Navigation** (Bottom Tabs + Stack)
- **Google Flights API** (via RapidAPI)
- **Google Gemini API** (for AI comparison)

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (installed with the project)
- iOS Simulator, Android Emulator, or Expo Go app on your phone

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RyanPurakal/flightcompare.git
   cd flightcompare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API keys**

   Add your API keys to `app.json` in the `extra` section, or create a `.env` file:

   ```json
   "extra": {
     "EXPO_PUBLIC_GEMINI_API_KEY": "your_gemini_api_key",
     "RAPIDAPIKEY": "your_rapidapi_key"
   }
   ```

   - **RapidAPI Key**: Required for flight search. Get one at [RapidAPI](https://rapidapi.com/) and subscribe to the [Google Flights API](https://rapidapi.com/google-cloud/api/google-flights2).
   - **Gemini API Key**: Required for AI comparison. Get one at [Google AI Studio](https://aistudio.google.com/).

4. **Start the app**
   ```bash
   npm start
   ```

   Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Project Structure

```
flightcompare/
├── App.js                 # App entry, tab navigation
├── app.json               # Expo config, API keys
├── components/
│   └── FlightCard.js      # Flight card with Compare button
├── navigation/
│   ├── FlightStack.js     # Flights stack (Homepage → FlightProfile)
│   └── TabNavigator.js    # Tab navigator (unused if using App.js)
├── screens/
│   ├── Homepage.js        # Flight search, filters, results
│   ├── Compare.js         # Side-by-side comparison + AI
│   ├── FlightProfile.js   # Flight details, save, price alert, share
│   └── History.js         # Saved flights (Favorites tab)
├── services/
│   ├── api.js             # Flight search API (RapidAPI)
│   ├── airports.js        # Airport list (100+ US airports)
│   ├── genai.js           # Gemini AI comparison
│   └── chatgpt.js         # OpenAI comparison (optional)
├── state/
│   └── SelectedFlightsContext.js  # Compare + saved flights state
├── utils/
│   ├── cache.js           # Flight results caching
│   ├── toast.js           # Toast notifications
│   ├── searchHistory.js   # Search history
│   └── priceAlerts.js     # Price alert management
└── __tests__/
    └── services/
        └── api.test.js    # API service tests
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run in web browser |
| `npm test` | Run Jest tests |

## How to Use

1. **Search Flights** — Select departure and arrival airports, pick a date, then view results.
2. **Add to Compare** — Tap "+ Compare" on any flight card, or use the Compare button on the flight profile.
3. **Compare** — Open the Compare tab to see both flights side-by-side. Tap "Get AI Comparison" for Gemini's recommendation.
4. **Save Flights** — Open a flight and tap "Save Flight" to add it to Favorites.
5. **Organize Favorites** — Use "Group By" (Route, Price Range) and "Sort By" (Price, Route) in the Favorites tab.
6. **Price Alerts** — On a flight profile, tap "Price Alert" and set a target price.

## License

Private project.
