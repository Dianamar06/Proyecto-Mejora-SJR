import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppRouter from '@/navigation/AppRouter';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppRouter />
    </SafeAreaProvider>
  );
}
