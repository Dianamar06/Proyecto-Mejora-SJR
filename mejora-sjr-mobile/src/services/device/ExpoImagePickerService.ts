import * as ImagePicker from 'expo-image-picker';

import type { PhotoFile } from '@/models/PhotoFile';
import type { IImagePickerService } from '@/services/contracts/IImagePickerService';

function extensionFromUri(uri: string): string {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match?.[1]?.toLowerCase() || 'jpg';
}

function mimeTypeFromExtension(extension: string): string {
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'heic' || extension === 'heif') return 'image/heic';
  return 'image/jpeg';
}

function toPhotoFile(asset: ImagePicker.ImagePickerAsset): PhotoFile {
  const extension = extensionFromUri(asset.uri);
  return {
    uri: asset.uri,
    name: asset.fileName || `evidencia-${Date.now()}.${extension}`,
    type: asset.mimeType || mimeTypeFromExtension(extension),
    width: asset.width,
    height: asset.height,
    ...(asset.fileSize === undefined ? {} : { fileSize: asset.fileSize }),
    ...(asset.file ? { file: asset.file } : {}),
  };
}

function firstPhoto(result: ImagePicker.ImagePickerResult): PhotoFile | null {
  if (result.canceled || !result.assets[0]) return null;
  return toPhotoFile(result.assets[0]);
}

export class ImagePermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImagePermissionError';
  }
}

/** Adaptador de dispositivo: concentra permisos y llamadas a expo-image-picker. */
export class ExpoImagePickerService implements IImagePickerService {
  async takePhoto(): Promise<PhotoFile | null> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new ImagePermissionError('Activa el permiso de cámara para tomar una fotografía.');
    }

    return firstPhoto(await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    }));
  }

  async selectFromGallery(): Promise<PhotoFile | null> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new ImagePermissionError('Activa el permiso de fotografías para elegir una evidencia.');
    }

    return firstPhoto(await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      allowsEditing: false,
      quality: 0.8,
    }));
  }
}

export const expoImagePickerService: IImagePickerService = new ExpoImagePickerService();
