import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackScreenProps } from '@react-navigation/native-stack';

import { useHomeViewModel } from '@/viewModels/useHomeViewModel';
import { useLoginViewModel } from '@/viewModels/useLoginViewModel';
import { HomeView } from '@/views/HomeView';
import { LoginView } from '@/views/LoginView';
import { ReportesView } from '@/views/ReportesView';
import { useReportesViewModel, type ReportesHttpService } from '@/viewModels/useReportesViewModel';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Reportes: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Composition adapters: navigation objects never reach the presentational views.
function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  const { continueToHome } = useLoginViewModel(() => navigation.navigate('Home'));

  return <LoginView onContinue={continueToHome} />;
}

function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { returnToLogin } = useHomeViewModel(() => navigation.popToTop());

  return <HomeView onReturnToLogin={returnToLogin} onOpenReportes={() => navigation.navigate('Reportes')} />;
}

function ReportesScreen({ apiService }: { apiService: ReportesHttpService }) {
  const { isLoading, reportes, error, reload } = useReportesViewModel(apiService);
  return <ReportesView isLoading={isLoading} reportes={reportes} error={error} onReload={reload} />;
}

export default function AppRouter({ apiService }: { apiService: ReportesHttpService }) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ contentStyle: { backgroundColor: '#FFFFFF' } }}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Acceso' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Mejora SJR' }} />
        <Stack.Screen name="Reportes" options={{ title: 'Reportes' }}>
          {() => <ReportesScreen apiService={apiService} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
