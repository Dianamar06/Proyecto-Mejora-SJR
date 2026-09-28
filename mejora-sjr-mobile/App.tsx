import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppRouter from '@/navigation/AppRouter';
import { AuthApiService } from '@/services/api/AuthApiService';
import { TokenStorage } from '@/services/storage/TokenStorage';

// Instancia estable: la composición raíz es la única que elige la implementación.
const apiService = new AuthApiService(undefined, new TokenStorage());

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppRouter apiService={apiService} />
    </SafeAreaProvider>
  );
}
