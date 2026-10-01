import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackScreenProps } from '@react-navigation/native-stack';

import { useHomeViewModel } from '@/viewModels/useHomeViewModel';
import { useLoginViewModel } from '@/viewModels/useLoginViewModel';
import { HomeView } from '@/views/HomeView';
import { LoginView } from '@/views/LoginView';
import { RegisterView } from '@/views/RegisterView';
import { ReportesView } from '@/views/ReportesView';
import { ReporteView } from '@/views/ReporteView';
import { useReporteViewModel } from '@/viewModels/useReporteViewModel';
import { CATEGORIAS_REPORTE } from '@/constants/categoriasReporte';
import { ReporteApiService } from '@/services/api/ReporteApiService';
import { TokenStorage } from '@/services/storage/TokenStorage';
import { useReportesViewModel, type ReportesHttpService } from '@/viewModels/useReportesViewModel';
import { useRegisterViewModel } from '@/viewModels/useRegisterViewModel';
import type { IAuthService } from '@/services/contracts/IAuthService';
import type { SessionViewModelReturn } from '@/viewModels/useSessionViewModel';
import { SessionLoadingView } from '@/views/SessionLoadingView';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Reportes: undefined;
  CrearReporte: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Composition adapters: navigation objects never reach the presentational views.
type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  authService: IAuthService;
  startSession: SessionViewModelReturn['startSession'];
};

function LoginScreen({ navigation, authService, startSession }: LoginScreenProps) {
  const viewModel = useLoginViewModel(authService, startSession);

  return (
    <LoginView
      viewModel={viewModel}
      onNavigateToRegister={() => navigation.navigate('Register')}
    />
  );
}

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'> & {
  authService: IAuthService;
};

function RegisterScreen({ navigation, authService }: RegisterScreenProps) {
  const viewModel = useRegisterViewModel(authService);

  return (
    <RegisterView
      viewModel={viewModel}
      onNavigateToLogin={() => navigation.goBack()}
      onRegisterSuccess={() => navigation.navigate('Login')}
    />
  );
}

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'> & {
  signOut: SessionViewModelReturn['signOut'];
};

function HomeScreen({ navigation, signOut }: HomeScreenProps) {
  const { signOut: closeSession } = useHomeViewModel(signOut);

  return (
    <HomeView 
      onSignOut={() => void closeSession()} 
      onOpenReportes={() => navigation.navigate('Reportes')} 
      onOpenCrearReporte={() => navigation.navigate('CrearReporte')}
    />
  );
}

function CrearReporteScreen() {
  const tokenStorage = new TokenStorage();
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
  const apiService = new ReporteApiService(baseUrl, tokenStorage);
  const viewModel = useReporteViewModel(apiService, CATEGORIAS_REPORTE);
  return <ReporteView {...viewModel} />;
}

function ReportesScreen({ apiService }: { apiService: ReportesHttpService }) {
  const { isLoading, reportes, error, reload } = useReportesViewModel(apiService);
  return <ReportesView isLoading={isLoading} reportes={reportes} error={error} onReload={reload} />;
}

type AppRouterProps = {
  apiService: ReportesHttpService & IAuthService;
  session: SessionViewModelReturn;
};

export default function AppRouter({ apiService, session }: AppRouterProps) {
  if (session.status === 'restoring') return <SessionLoadingView />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: '#FFFFFF' } }}>
        {session.isAuthenticated ? (
          <>
            <Stack.Screen name="Home" options={{ title: 'Mejora SJR' }}>
              {(props) => <HomeScreen {...props} signOut={session.signOut} />}
            </Stack.Screen>
            <Stack.Screen name="Reportes" options={{ title: 'Reportes' }}>
              {() => <ReportesScreen apiService={apiService} />}
            </Stack.Screen>
            <Stack.Screen name="CrearReporte" options={{ title: 'Nuevo Reporte' }}>
              {() => <CrearReporteScreen />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Login" options={{ title: 'Acceso' }}>
              {(props) => <LoginScreen {...props} authService={apiService} startSession={session.startSession} />}
            </Stack.Screen>
            <Stack.Screen name="Register" options={{ title: 'Registro' }}>
              {(props) => <RegisterScreen {...props} authService={apiService} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
