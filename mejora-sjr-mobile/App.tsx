import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppRouter from '@/navigation/AppRouter';
import { AuthApiService } from '@/services/api/AuthApiService';
import { TokenStorage } from '@/services/storage/TokenStorage';
import { useSessionViewModel } from '@/viewModels/useSessionViewModel';

// Instancia estable: la composición raíz es la única que elige la implementación.
const tokenStorage = new TokenStorage();
const apiService = new AuthApiService(undefined, tokenStorage);

export default function App() {
  const session = useSessionViewModel(tokenStorage);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppRouter apiService={apiService} session={session} />
    </SafeAreaProvider>
  );
}
