import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './navigation/FlightStack';
import Compare from './screens/Compare';
import SavedFlights from './screens/History';
import { SelectedFlightsProvider } from './state/SelectedFlightsContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SelectedFlightsProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#111' },
            headerTintColor: '#fff',
            tabBarStyle: { backgroundColor: '#111' },
            tabBarActiveTintColor: '#fff',
          }}
        >
          <Tab.Screen name="Flights" component={HomeStack} />
          <Tab.Screen name="Compare" component={Compare} />
          <Tab.Screen name="Favorites" component={SavedFlights} />
        </Tab.Navigator>
      </NavigationContainer>
    </SelectedFlightsProvider>
  );
}
