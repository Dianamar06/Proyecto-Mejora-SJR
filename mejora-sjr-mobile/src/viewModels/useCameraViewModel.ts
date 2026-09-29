import { useCallback, useEffect, useRef, useState } from 'react';

import type { PhotoFile } from '@/models/PhotoFile';
import type { IImagePickerService } from '@/services/contracts/IImagePickerService';

export interface CameraViewModelReturn {
  photo: PhotoFile | null;
  isLoading: boolean;
  error: string | null;
  takePhoto: () => Promise<void>;
  selectFromGallery: () => Promise<void>;
  clearPhoto: () => void;
}

export function useCameraViewModel(imagePickerService: IImagePickerService): CameraViewModelReturn {
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selecting = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const select = useCallback(async (source: 'camera' | 'gallery') => {
    if (selecting.current) return;
    selecting.current = true;
    if (mounted.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const selected = source === 'camera'
        ? await imagePickerService.takePhoto()
        : await imagePickerService.selectFromGallery();

      // Cancelar el selector conserva la evidencia elegida anteriormente.
      if (selected && mounted.current) setPhoto(selected);
    } catch (cause) {
      if (mounted.current) {
        setError(cause instanceof Error ? cause.message : 'No fue posible obtener la fotografía.');
      }
    } finally {
      selecting.current = false;
      if (mounted.current) setIsLoading(false);
    }
  }, [imagePickerService]);

  const clearPhoto = useCallback(() => {
    if (selecting.current) return;
    if (mounted.current) {
      setPhoto(null);
      setError(null);
    }
  }, []);

  return {
    photo,
    isLoading,
    error,
    takePhoto: useCallback(() => select('camera'), [select]),
    selectFromGallery: useCallback(() => select('gallery'), [select]),
    clearPhoto,
  };
}
