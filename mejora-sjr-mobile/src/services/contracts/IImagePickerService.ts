import type { PhotoFile } from '@/models/PhotoFile';

/** ISP: el ViewModel solo conoce las dos operaciones que necesita. */
export interface IImagePickerService {
  takePhoto(): Promise<PhotoFile | null>;
  selectFromGallery(): Promise<PhotoFile | null>;
}
