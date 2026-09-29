import { IAuthService } from '../contracts/IAuthService';
import { LoginPayload, RegisterPayload, AuthResponse } from '../../models/Auth';

/**
 * MockAuthService — Implementación de pruebas para simular llamadas de red
 * sin depender de un backend activo. Ideal para pruebas unitarias de los ViewModels.
 */
export class MockAuthService implements IAuthService {
  public shouldFail: boolean = false;
  public failureMessage: string = 'Error simulado de autenticación';
  public mockToken: string = 'mock-jwt-token-xyz123';

  async login(payload: LoginPayload): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    if (payload.Correo === 'error@sjr.gob.mx' || !payload.Password) {
      throw new Error('Credenciales inválidas');
    }

    return {
      token: this.mockToken,
      usuario: {
        id: 101,
        correo: payload.Correo,
        nombreCompleto: 'Ciudadano Prueba San Juan',
        rol: 'CIUDADANO',
      },
      message: 'Inicio de sesión exitoso',
    };
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    return {
      token: this.mockToken,
      usuario: {
        id: 102,
        nombreCompleto: payload.NombreCompleto,
        correo: payload.Correo,
        telefono: payload.Telefono,
        rol: 'CIUDADANO',
      },
      message: 'Registro exitoso',
    };
  }
}
