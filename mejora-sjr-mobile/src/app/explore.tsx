import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Explorar</Text>
        <Text style={styles.subtitle}>Pantalla base del proyecto Mejora SJR.</Text>
        <Text style={styles.text}>
          Aquí puedes añadir contenido de exploración o futuras secciones del módulo móvil.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#163344',
  },
  subtitle: {
    fontSize: 18,
    color: '#155E75',
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    color: '#465763',
    lineHeight: 24,
  },
});
