import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LoginViewModelReturn } from '../viewModels/useLoginViewModel';
import { AuthResponse } from '../models/Auth';

export interface LoginViewProps {
  /** Callback para navegar a la pantalla de Registro */
  onNavigateToRegister?: () => void;
  /** Callback ejecutado al autenticarse exitosamente */
  onLoginSuccess?: (authData: AuthResponse | null) => void;
  /** Inyección opcional del ViewModel para pruebas de UI aisladas */
  viewModel: LoginViewModelReturn;
}

/**
 * LoginView — Vista tonta (Dumb View) para el inicio de sesión ciudadano.
 * 
 * Reglas Arquitectónicas:
 * ✅ Cero llamadas de red o lógica de negocio.
 * ✅ Renderiza exclusivamente componentes nativos (View, Text, TextInput, etc.).
 * ✅ Todo el estado y la interacción se delegan al useLoginViewModel.
 */
export const LoginView: React.FC<LoginViewProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
  viewModel,
}) => {
  const vm = viewModel;

  // Manejar el submit y disparar callback si tiene éxito
  const handlePressLogin = async () => {
    const success = await vm.handleSubmit();
    if (success && onLoginSuccess) {
      onLoginSuccess(vm.authData);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Encabezado e Identidad */}
          <View style={styles.header}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>Mejora SJR Móvil</Text>
            </View>
            <Text style={styles.title}>¡Bienvenido!</Text>
            <Text style={styles.subtitle}>
              Ingresa con tu cuenta ciudadana para consultar y reportar incidencias en San Juan del Río.
            </Text>
          </View>

          {/* Tarjeta del Formulario */}
          <View style={styles.formCard}>
            {/* Mensaje de Error */}
            {vm.errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{vm.errorMessage}</Text>
                <TouchableOpacity onPress={vm.clearError} style={styles.dismissButton}>
                  <Text style={styles.dismissButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Campo: Correo Electrónico */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={vm.correo}
                onChangeText={vm.setCorreo}
                editable={!vm.isLoading}
              />
            </View>

            {/* Campo: Contraseña */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!vm.showPassword}
                  autoCapitalize="none"
                  value={vm.password}
                  onChangeText={vm.setPassword}
                  editable={!vm.isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={vm.toggleShowPassword}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.eyeText}>{vm.showPassword ? 'Ocultar' : 'Ver'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón Principal de Inicio de Sesión */}
            <TouchableOpacity
              style={[styles.primaryButton, vm.isLoading && styles.buttonDisabled]}
              onPress={handlePressLogin}
              disabled={vm.isLoading}
              activeOpacity={0.8}
            >
              {vm.isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            {/* Enlace para Navegar a Registro */}
            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>¿Aún no tienes cuenta ciudadana?</Text>
              <TouchableOpacity
                onPress={onNavigateToRegister}
                disabled={vm.isLoading}
                style={styles.registerLinkButton}
              >
                <Text style={styles.registerLinkText}>Regístrate aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 28,
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  badgeText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '500',
    marginRight: 8,
  },
  dismissButton: {
    padding: 4,
  },
  dismissButtonText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  eyeText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
    gap: 4,
  },
  footerPrompt: {
    fontSize: 14,
    color: '#64748B',
  },
  registerLinkButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  registerLinkText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '700',
  },
});

export default LoginView;
