import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function SessionLoadingView() {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Restaurando sesión" style={styles.container}>
      <ActivityIndicator size="large" color="#155E75" />
      <Text style={styles.text}>Restaurando sesión…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#FFFFFF' },
  text: { color: '#465763', fontSize: 16 },
});
