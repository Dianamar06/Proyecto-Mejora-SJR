import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PhotoFile } from '@/models/PhotoFile';

export interface CameraSelectorProps {
  photo: PhotoFile | null;
  isLoading: boolean;
  error: string | null;
  onTakePhoto: () => void;
  onSelectFromGallery: () => void;
  onRemovePhoto: () => void;
  onPhotoTaken: (file: PhotoFile) => void;
}

/**
 * Componente 100% visual: no importa ImagePicker, no solicita permisos y no
 * conserva estado. Recibe datos y comunica las acciones exclusivamente por props.
 */
export function CameraSelector({
  photo,
  isLoading,
  error,
  onTakePhoto,
  onSelectFromGallery,
  onRemovePhoto,
  onPhotoTaken,
}: CameraSelectorProps) {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>Evidencia fotográfica</Text>
      <Text style={styles.help}>Toma una foto o elige una imagen de tu galería.</Text>

      {photo ? (
        <Image source={{ uri: photo.uri }} accessibilityLabel="Vista previa de la evidencia" style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Sin fotografía seleccionada</Text>
        </View>
      )}

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Pressable accessibilityRole="button" disabled={isLoading} onPress={onTakePhoto} style={[styles.button, isLoading && styles.disabled]}>
          <Text style={styles.buttonText}>Abrir cámara</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={isLoading} onPress={onSelectFromGallery} style={[styles.secondaryButton, isLoading && styles.disabled]}>
          <Text style={styles.secondaryText}>Elegir de galería</Text>
        </Pressable>
      </View>

      {isLoading ? <ActivityIndicator accessibilityLabel="Abriendo selector de imágenes" color="#155E75" /> : null}

      {photo ? (
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" disabled={isLoading} onPress={() => onPhotoTaken(photo)} style={[styles.button, isLoading && styles.disabled]}>
            <Text style={styles.buttonText}>Usar esta foto</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={isLoading} onPress={onRemovePhoto} style={styles.removeButton}>
            <Text style={styles.removeText}>Quitar</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  title: { color: '#163344', fontSize: 18, fontWeight: '700' },
  help: { color: '#465763', lineHeight: 20 },
  preview: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12, backgroundColor: '#E2E8F0' },
  placeholder: { aspectRatio: 4 / 3, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#94A3B8', backgroundColor: '#F8FAFC' },
  placeholderText: { color: '#64748B' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  button: { flexGrow: 1, alignItems: 'center', borderRadius: 10, backgroundColor: '#155E75', padding: 13 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  secondaryButton: { flexGrow: 1, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#155E75', padding: 13 },
  secondaryText: { color: '#155E75', fontWeight: '700' },
  removeButton: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 13 },
  removeText: { color: '#B91C1C', fontWeight: '700' },
  error: { color: '#B91C1C', lineHeight: 20 },
  disabled: { opacity: 0.55 },
});
