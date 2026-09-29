import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import type { CategoriaReporte, CrearReportePayload, ErroresReporte, EvidenciaArchivo, ReporteFormulario } from '../models/Reporte';
import type { IReporteApiService } from '../services/contracts/IReporteApiService';

const nuevoFormulario = (): ReporteFormulario => ({
  Titulo: '',
  Descripcion: '',
  UbicacionLatitud: '',
  UbicacionLongitud: '',
  DireccionFisica: '',
  EvidenciaUrl: '',
  IdCategoria: null,
  foto: null,
});

/** Validación y transformación de datos pertenecientes exclusivamente al ViewModel. */
export function validarReporte(
  formulario: ReporteFormulario,
  categorias: readonly CategoriaReporte[]
): {
  errores: ErroresReporte;
  payload: CrearReportePayload | null;
} {
  const errores: ErroresReporte = {};

  if (!formulario.Titulo.trim()) {
    errores.Titulo = 'Escribe un título.';
  }

  if (!formulario.Descripcion.trim()) {
    errores.Descripcion = 'Describe la incidencia.';
  }

  const coordenada = (campo: 'UbicacionLatitud' | 'UbicacionLongitud', limite: number) => {
    const texto = formulario[campo].trim().replace(',', '.');
    const valor = Number(texto);
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(texto) || !Number.isFinite(valor) || Math.abs(valor) > limite) {
      errores[campo] = `Ingresa un número entre -${limite} y ${limite}.`;
    }
    return valor;
  };

  const UbicacionLatitud = coordenada('UbicacionLatitud', 90);
  const UbicacionLongitud = coordenada('UbicacionLongitud', 180);

  if (
    !Number.isInteger(formulario.IdCategoria) ||
    (formulario.IdCategoria ?? 0) <= 0 ||
    !categorias.some(categoria => categoria.IdCategoria === formulario.IdCategoria)
  ) {
    errores.IdCategoria = 'Selecciona una categoría disponible.';
  }

  const EvidenciaUrl = formulario.EvidenciaUrl.trim();
  if (EvidenciaUrl) {
    try {
      const url = new URL(EvidenciaUrl);
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error();
    } catch {
      errores.EvidenciaUrl = 'Usa una URL válida que comience con http:// o https://.';
    }
  }

  if (Object.keys(errores).length > 0) {
    return { errores, payload: null };
  }

  return {
    errores,
    payload: {
      Titulo: formulario.Titulo.trim(),
      Descripcion: formulario.Descripcion.trim(),
      UbicacionLatitud,
      UbicacionLongitud,
      DireccionFisica: formulario.DireccionFisica.trim(),
      EvidenciaUrl,
      IdCategoria: formulario.IdCategoria!,
    },
  };
}

/**
 * useReporteViewModel — Custom Hook (ViewModel) para la creación de reportes y geolocalización (HU-17).
 * 
 * Cumple estrictamente con:
 * - MVVM: Estado y lógica desacoplados de la Vista.
 * - SRP: Vistas dibujan UI nativa; ViewModel orquesta GPS, validaciones y peticiones.
 * - DIP: Inyección obligatoria de IReporteApiService por parámetro. Sin dependencias HTTP directas.
 */
export function useReporteViewModel(
  apiService: IReporteApiService,
  categorias: readonly CategoriaReporte[]
) {
  const [formulario, setFormulario] = useState<ReporteFormulario>(nuevoFormulario);
  const [errores, setErrores] = useState<ErroresReporte>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const enviando = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  function cambiarCampo<K extends keyof ReporteFormulario>(campo: K, valor: ReporteFormulario[K]) {
    if (enviando.current) return;
    setFormulario(actual => ({ ...actual, [campo]: valor }));
    if (campo !== 'foto') {
      setErrores(actual => ({ ...actual, [campo]: undefined }));
    }
    setError(null);
    setIsSuccess(false);
  }

  /**
   * Obtiene la ubicación GPS actual automáticamente con expo-location.
   */
  async function obtenerUbicacionGPS(): Promise<void> {
    if (isGpsLoading || enviando.current) return;
    setIsGpsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (mounted.current) {
          setError('Permiso de ubicación no concedido. Puedes ingresar las coordenadas manualmente.');
        }
        return;
      }

      const ubicacion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (mounted.current && ubicacion?.coords) {
        const lat = ubicacion.coords.latitude.toFixed(6);
        const lon = ubicacion.coords.longitude.toFixed(6);
        setFormulario(actual => ({
          ...actual,
          UbicacionLatitud: lat,
          UbicacionLongitud: lon,
        }));
        setErrores(actual => ({
          ...actual,
          UbicacionLatitud: undefined,
          UbicacionLongitud: undefined,
        }));
      }
    } catch (e) {
      if (mounted.current) {
        const mensaje = e instanceof Error ? e.message : 'No se pudo obtener la ubicación GPS.';
        setError(mensaje);
      }
    } finally {
      if (mounted.current) {
        setIsGpsLoading(false);
      }
    }
  }

  /**
   * Permite seleccionar una foto de la galería para la evidencia.
   */
  async function seleccionarFoto(): Promise<void> {
    if (enviando.current) return;
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        const asset = resultado.assets[0];
        const foto: EvidenciaArchivo = {
          uri: asset.uri,
          name: asset.fileName || `evidencia_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        };
        cambiarCampo('foto', foto);
      }
    } catch {
      setError('No se pudo abrir la galería de imágenes.');
    }
  }

  /**
   * Permite tomar una foto con la cámara para la evidencia.
   */
  async function tomarFoto(): Promise<void> {
    if (enviando.current) return;
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Permiso de cámara no concedido.');
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        const asset = resultado.assets[0];
        const foto: EvidenciaArchivo = {
          uri: asset.uri,
          name: asset.fileName || `evidencia_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        };
        cambiarCampo('foto', foto);
      }
    } catch {
      setError('No se pudo acceder a la cámara.');
    }
  }

  function eliminarFoto(): void {
    if (enviando.current) return;
    cambiarCampo('foto', null);
  }

  /**
   * Flujo de envío de red estricto (HU-17):
   * 1. POST JSON a /api/reportes con las llaves exactas:
   *    Titulo, Descripcion, UbicacionLatitud, UbicacionLongitud, IdCategoria.
   * 2. Extrae el IdReporte retornado por la llamada.
   * 3. Si el usuario adjuntó una foto, realiza POST multipart/form-data a /api/reportes/:id/evidencia
   *    bajo el campo 'evidencia'.
   * 4. Mantiene el estado isLoading (spinner) activo durante ambas operaciones.
   */
  async function enviarReporte(): Promise<void> {
    if (enviando.current || isSuccess) return;

    const validacion = validarReporte(formulario, categorias);
    setErrores(validacion.errores);
    setError(null);

    if (!validacion.payload) return;

    enviando.current = true;
    setIsLoading(true);

    try {
      // 1. Envío JSON de reporte
      const resultadoCreacion = await apiService.crearReporte(validacion.payload);
      const idReporte = resultadoCreacion?.IdReporte;

      // 2. Si adjuntó foto, envío de evidencia fotográfica multipart
      if (formulario.foto && idReporte) {
        await apiService.subirEvidencia(idReporte, formulario.foto);
      }

      if (mounted.current) {
        setIsSuccess(true);
      }
    } catch (cause) {
      if (mounted.current) {
        setError(cause instanceof Error ? cause.message : 'No se pudo enviar el reporte. Intenta de nuevo.');
      }
    } finally {
      enviando.current = false;
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }

  function reiniciarFormulario(): void {
    if (enviando.current) return;
    setFormulario(nuevoFormulario());
    setErrores({});
    setError(null);
    setIsSuccess(false);
  }

  return {
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
  };
}
