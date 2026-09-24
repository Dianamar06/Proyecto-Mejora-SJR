import { Button, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LoginViewProps = {
  onContinue: () => void;
};

export function LoginView({ onContinue }: LoginViewProps) {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Text accessibilityRole="header" style={styles.title}>Bienvenido a Mejora SJR</Text>
      <Text style={styles.description}>Plataforma municipal de reportes ciudadanos.</Text>
      <Text style={styles.description}>El inicio de sesión estará disponible próximamente.</Text>
      <Button title="Explorar inicio" onPress={onContinue} color="#155E75" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#163344', textAlign: 'center' },
  description: { fontSize: 16, color: '#465763', textAlign: 'center' },
});
