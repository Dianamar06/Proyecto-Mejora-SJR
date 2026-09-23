import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppRouter from '@/navigation/AppRouter';
import { ApiService } from '@/services/api/apiService';
import { TokenStorage } from '@/services/storage/TokenStorage';

// Instancia estable: la composición raíz es la única que elige la implementación.
const apiService = new ApiService(new TokenStorage());

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppRouter apiService={apiService} />
    </SafeAreaProvider>
  );
}
