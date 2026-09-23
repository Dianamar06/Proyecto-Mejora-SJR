import { ActivityIndicator, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ReportesViewProps = {
  isLoading: boolean;
  reportes: readonly { id: string; titulo: string; descripcion: string; estado: string }[];
  error: string | null;
  onReload: () => void;
};

export function ReportesView({ isLoading, reportes, error, onReload }: ReportesViewProps) {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Text accessibilityRole="header" style={styles.title}>Reportes ciudadanos</Text>
      {isLoading ? (
        <View style={styles.message}>
          <ActivityIndicator accessibilityLabel="Cargando reportes" size="large" />
          <Text>Cargando reportes…</Text>
        </View>
      ) : error ? (
        <View style={styles.message}>
          <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
          <Button title="Reintentar" onPress={onReload} color="#155E75" />
        </View>
      ) : (
        <>
          <Button title="Actualizar reportes" onPress={onReload} color="#155E75" />
          <FlatList
            data={reportes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text>No hay reportes disponibles.</Text>}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <Text style={styles.description}>{item.descripcion}</Text>
                <Text style={styles.status}>Estado: {item.estado}</Text>
              </View>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#163344' },
  message: { gap: 16, alignItems: 'center' },
  list: { gap: 12, paddingBottom: 24 },
  card: { padding: 16, borderRadius: 8, backgroundColor: '#EFF6F8', gap: 8 },
  description: { fontSize: 16, color: '#163344' },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#163344' },
  status: { color: '#465763' },
  error: { color: '#A12121' },
});
