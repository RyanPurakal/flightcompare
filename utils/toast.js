// Simple toast notification utility
import { Alert } from 'react-native';

export const showToast = (message, type = 'info') => {
  // For now, using Alert. In production, use a proper toast library like react-native-toast-message
  if (type === 'error') {
    Alert.alert('Error', message);
  } else if (type === 'success') {
    Alert.alert('Success', message);
  } else {
    Alert.alert('Info', message);
  }
};

export const showError = (message) => showToast(message, 'error');
export const showSuccess = (message) => showToast(message, 'success');
export const showInfo = (message) => showToast(message, 'info');


