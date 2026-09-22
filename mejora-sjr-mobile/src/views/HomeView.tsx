import { Button, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HomeViewProps = {
  onReturnToLogin: () => void;
};

export function HomeView({ onReturnToLogin }: HomeViewProps) {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Text accessibilityRole="header" style={styles.title}>Inicio</Text>
      <Text style={styles.description}>Aquí podrás crear y consultar tus reportes ciudadanos.</Text>
      <Button title="Volver al acceso" onPress={onReturnToLogin} color="#155E75" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#163344', textAlign: 'center' },
  description: { fontSize: 16, color: '#465763', textAlign: 'center' },
});
