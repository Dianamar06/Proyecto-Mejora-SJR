/** Archivo listo para agregarse al campo `evidencia` de FormData. */
export interface PhotoFile {
  uri: string;
  name: string;
  type: string;
  width: number;
  height: number;
  fileSize?: number;
  /** Expo lo entrega en web; React Native utiliza uri, name y type. */
  file?: File;
}
