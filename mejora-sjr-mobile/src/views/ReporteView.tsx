import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CategoriaReporte, ErroresReporte, ReporteFormulario } from '../models/Reporte';

export interface ReporteViewProps {
  formulario: ReporteFormulario;
  categorias: readonly CategoriaReporte[];
  errores: ErroresReporte;
  isLoading: boolean;
  isGpsLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  cambiarCampo: <K extends keyof ReporteFormulario>(campo: K, valor: ReporteFormulario[K]) => void;
  obtenerUbicacionGPS: () => Promise<void>;
  seleccionarFoto: () => Promise<void>;
  tomarFoto: () => Promise<void>;
  eliminarFoto: () => void;
  enviarReporte: () => Promise<void>;
  reiniciarFormulario: () => void;
}

type CampoTexto = 'Titulo' | 'Descripcion' | 'DireccionFisica';

const camposTexto: readonly { campo: CampoTexto; etiqueta: string; ejemplo: string; multiline?: boolean }[] = [
  { campo: 'Titulo', etiqueta: 'Título *', ejemplo: 'Ej. Bache profundo en calle Juárez' },
  { campo: 'Descripcion', etiqueta: 'Descripción *', ejemplo: 'Describe detalladamente la incidencia', multiline: true },
  { campo: 'DireccionFisica', etiqueta: 'Dirección o referencia (opcional)', ejemplo: 'Calle, colonia y esquinas' },
];

/**
 * ReporteView — Vista Tonta (Dumb View) para el levantamiento de incidencias (HU-17).
 * Cumple con SRP e ISP: Solo dibuja componentes nativos y delega eventos al ViewModel.
 */
export function ReporteView({
  formulario,
  categorias,
  errores,
  isLoading,
  isGpsLoading,
  error,
  isSuccess,
  cambiarCampo,
  obtenerUbicacionGPS,
  seleccionarFoto,
  tomarFoto,
  eliminarFoto,
  enviarReporte,
  reiniciarFormulario,
}: ReporteViewProps) {
  return (
    <SafeAreaView style={styles.page} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Nueva Incidencia</Text>
          <Text style={styles.description}>
            Reporta incidencias en San Juan del Río. Obtén tu ubicación exacta con GPS y adjunta una foto como evidencia.
          </Text>

          {isSuccess ? (
            <View style={styles.card}>
              <Text accessibilityRole="alert" style={styles.success}>
                ✓ Tu reporte y evidencia han sido enviados exitosamente.
              </Text>
              <Pressable accessibilityRole="button" style={styles.button} onPress={reiniciarFormulario}>
                <Text style={styles.buttonText}>Crear otro reporte</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.card}>
              {/* Campos de texto principales */}
              {camposTexto.map(({ campo, etiqueta, ejemplo, multiline }) => (
                <View key={campo} style={styles.field}>
                  <Text style={styles.label}>{etiqueta}</Text>
                  <TextInput
                    accessibilityLabel={etiqueta}
                    style={[styles.input, multiline && styles.multiline, !!errores[campo] && styles.invalid]}
                    value={formulario[campo]}
                    onChangeText={valor => cambiarCampo(campo, valor)}
                    placeholder={ejemplo}
                    placeholderTextColor="#64748B"
                    editable={!isLoading}
                    multiline={multiline}
                  />
                  {errores[campo] ? <Text accessibilityRole="alert" style={styles.errorText}>{errores[campo]}</Text> : null}
                </View>
              ))}

              {/* Sección de Geolocalización GPS (HU-17) */}
              <View style={styles.gpsContainer}>
                <Text style={styles.label}>Ubicación Geográfica *</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isGpsLoading || isLoading, busy: isGpsLoading }}
                  disabled={isGpsLoading || isLoading}
                  style={[styles.gpsButton, (isGpsLoading || isLoading) && styles.disabled]}
                  onPress={obtenerUbicacionGPS}
                >
                  {isGpsLoading ? <ActivityIndicator color="#4F46E5" size="small" /> : null}
                  <Text style={styles.gpsButtonText}>
                    {isGpsLoading ? 'Obteniendo GPS…' : '📍 Obtener ubicación por GPS'}
                  </Text>
                </Pressable>

                <View style={styles.coordsRow}>
                  <View style={styles.coordField}>
                    <Text style={styles.subLabel}>Latitud</Text>
                    <TextInput
                      accessibilityLabel="Latitud"
                      style={[styles.input, !!errores.UbicacionLatitud && styles.invalid]}
                      value={formulario.UbicacionLatitud}
                      onChangeText={val => cambiarCampo('UbicacionLatitud', val)}
                      placeholder="20.3889"
                      placeholderTextColor="#64748B"
                      editable={!isLoading}
                    />
                  </View>
                  <View style={styles.coordField}>
                    <Text style={styles.subLabel}>Longitud</Text>
                    <TextInput
                      accessibilityLabel="Longitud"
                      style={[styles.input, !!errores.UbicacionLongitud && styles.invalid]}
                      value={formulario.UbicacionLongitud}
                      onChangeText={val => cambiarCampo('UbicacionLongitud', val)}
                      placeholder="-99.9961"
                      placeholderTextColor="#64748B"
                      editable={!isLoading}
                    />
                  </View>
                </View>
                {errores.UbicacionLatitud ? <Text style={styles.errorText}>{errores.UbicacionLatitud}</Text> : null}
                {errores.UbicacionLongitud ? <Text style={styles.errorText}>{errores.UbicacionLongitud}</Text> : null}
              </View>

              {/* Selector de Categorías */}
              <Text style={styles.label}>Categoría *</Text>
              <View accessibilityRole="radiogroup" accessibilityLabel="Categoría de la incidencia" style={styles.categories}>
                {categorias.map(({ IdCategoria, Nombre }) => (
                  <Pressable
                    key={IdCategoria}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: formulario.IdCategoria === IdCategoria, disabled: isLoading }}
                    disabled={isLoading}
                    onPress={() => cambiarCampo('IdCategoria', IdCategoria)}
                    style={[styles.category, formulario.IdCategoria === IdCategoria && styles.selectedCategory]}
                  >
                    <Text style={styles.label}>{formulario.IdCategoria === IdCategoria ? '● ' : '○ '}{Nombre}</Text>
                  </Pressable>
                ))}
              </View>
              {errores.IdCategoria ? <Text style={styles.errorText}>{errores.IdCategoria}</Text> : null}

              {/* Sección de Foto / Evidencia Fotográfica (HU-17) */}
              <View style={styles.evidenceContainer}>
                <Text style={styles.label}>Evidencia Fotográfica (Opcional)</Text>
                {formulario.foto?.uri ? (
                  <View style={styles.previewBox}>
                    <Image source={{ uri: formulario.foto.uri }} style={styles.previewImage} resizeMode="cover" />
                    <Pressable style={styles.removePhotoButton} onPress={eliminarFoto} disabled={isLoading}>
                      <Text style={styles.removePhotoText}>✕ Eliminar foto</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.photoActionsRow}>
                    <Pressable
                      style={[styles.photoButton, isLoading && styles.disabled]}
                      onPress={tomarFoto}
                      disabled={isLoading}
                    >
                      <Text style={styles.photoButtonText}>📷 Tomar Foto</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.photoButton, isLoading && styles.disabled]}
                      onPress={seleccionarFoto}
                      disabled={isLoading}
                    >
                      <Text style={styles.photoButtonText}>🖼️ Galería</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Mensajes de Error */}
              {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}

              {/* Botón de Envío con Spinner */}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoading || !categorias.length, busy: isLoading }}
                disabled={isLoading || !categorias.length}
                style={[styles.button, (isLoading || !categorias.length) && styles.disabled]}
                onPress={enviarReporte}
              >
                {isLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : null}
                <Text style={styles.buttonText}>
                  {isLoading ? 'Enviando reporte y evidencia…' : 'Enviar reporte'}
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, gap: 16, maxWidth: 600, width: '100%', alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A' },
  description: { color: '#475569', lineHeight: 22 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  field: { gap: 6 },
  label: { color: '#334155', fontWeight: '600', fontSize: 15 },
  subLabel: { color: '#64748B', fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, color: '#0F172A', fontSize: 16, backgroundColor: '#F8FAFC' },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  invalid: { borderColor: '#DC2626' },
  errorText: { color: '#DC2626', fontSize: 13, lineHeight: 18 },
  success: { color: '#166534', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  gpsContainer: { gap: 8, padding: 12, backgroundColor: '#F1F5F9', borderRadius: 12 },
  gpsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#C7D2FE', gap: 8 },
  gpsButtonText: { color: '#4F46E5', fontWeight: '700', fontSize: 14 },
  coordsRow: { flexDirection: 'row', gap: 10 },
  coordField: { flex: 1, gap: 4 },
  categories: { gap: 8 },
  category: { padding: 14, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10 },
  selectedCategory: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  evidenceContainer: { gap: 8 },
  photoActionsRow: { flexDirection: 'row', gap: 10 },
  photoButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, alignItems: 'center', backgroundColor: '#F8FAFC' },
  photoButtonText: { color: '#334155', fontWeight: '600', fontSize: 14 },
  previewBox: { alignItems: 'center', gap: 8, padding: 8, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12 },
  previewImage: { width: '100%', height: 180, borderRadius: 8 },
  removePhotoButton: { padding: 6 },
  removePhotoText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  button: { flexDirection: 'row', backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
