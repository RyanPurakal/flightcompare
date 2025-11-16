import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Homepage from '../screens/Homepage';
import FlightProfile from '../screens/FlightProfile';

const Stack = createStackNavigator();

export default function FlightStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="All Flights" component={Homepage} />
      <Stack.Screen
        name="FlightProfile"
        component={FlightProfile}
        options={({ route }) => ({ title: route.params?.flight?.title || 'Profile' })}
      />
    </Stack.Navigator>
  );
}
