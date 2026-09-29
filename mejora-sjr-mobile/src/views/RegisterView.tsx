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
import { RegisterViewModelReturn } from '../viewModels/useRegisterViewModel';
import { AuthResponse } from '../models/Auth';

export interface RegisterViewProps {
  /** Callback para navegar de regreso a la pantalla de Login */
  onNavigateToLogin?: () => void;
  /** Callback ejecutado cuando el registro es exitoso */
  onRegisterSuccess?: (authData: AuthResponse | null) => void;
  /** Inyección opcional del ViewModel para testing o previews */
  viewModel: RegisterViewModelReturn;
}

/**
 * RegisterView — Vista tonta (Dumb View) para el registro de ciudadanos.
 * 
 * Reglas Arquitectónicas:
 * ✅ Cero llamadas de red o lógica de negocio.
 * ✅ Renderiza exclusivamente componentes nativos (View, Text, TextInput, etc.).
 * ✅ Todo el estado y la interacción se delegan al useRegisterViewModel.
 */
export const RegisterView: React.FC<RegisterViewProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
  viewModel,
}) => {
  const vm = viewModel;

  const handlePressRegister = async () => {
    const success = await vm.handleSubmit();
    if (success && onRegisterSuccess) {
      onRegisterSuccess(vm.authData);
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
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>
              Regístrate para reportar baches, luminarias y mejorar nuestra ciudad de San Juan del Río.
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

            {/* Campo: Nombre Completo */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan Pérez García"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                autoCorrect={false}
                value={vm.nombreCompleto}
                onChangeText={vm.setNombreCompleto}
                editable={!vm.isLoading}
              />
            </View>

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

            {/* Campo: Teléfono */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Teléfono (10 dígitos)</Text>
              <TextInput
                style={styles.input}
                placeholder="4271234567"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={vm.telefono}
                onChangeText={vm.setTelefono}
                editable={!vm.isLoading}
              />
            </View>

            {/* Campo: Contraseña */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Mínimo 6 caracteres"
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

            {/* Campo: Confirmar Contraseña */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!vm.showPassword}
                autoCapitalize="none"
                value={vm.confirmPassword}
                onChangeText={vm.setConfirmPassword}
                editable={!vm.isLoading}
              />
            </View>

            {/* Botón Principal de Registro */}
            <TouchableOpacity
              style={[styles.primaryButton, vm.isLoading && styles.buttonDisabled]}
              onPress={handlePressRegister}
              disabled={vm.isLoading}
              activeOpacity={0.8}
            >
              {vm.isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Registrarme</Text>
              )}
            </TouchableOpacity>

            {/* Enlace para volver a Iniciar Sesión */}
            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>¿Ya tienes una cuenta?</Text>
              <TouchableOpacity
                onPress={onNavigateToLogin}
                disabled={vm.isLoading}
                style={styles.loginLinkButton}
              >
                <Text style={styles.loginLinkText}>Inicia Sesión</Text>
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
    paddingTop: 32,
    paddingBottom: 48,
    justifyContent: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  badgeContainer: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    paddingHorizontal: 12,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  dismissButton: {
    padding: 4,
  },
  dismissButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
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
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eyeText: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
    gap: 4,
  },
  footerPrompt: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLinkButton: {
    paddingVertical: 2,
  },
  loginLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
});
