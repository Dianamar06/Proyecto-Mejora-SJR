import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, TouchableOpacityProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

export interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
  onPress: () => void;
}

/**
 * Componente CustomButton
 * Siguiendo SOLID (Single Responsibility Principle): Este botón solo se encarga de renderizar la UI 
 * interactiva basándose en las propiedades que recibe. No maneja lógica de negocio.
 * 
 * (Open/Closed Principle): Es fácil añadir nuevas variantes sin modificar el componente principal.
 */
export function CustomButton({ 
  title, 
  variant = 'primary', 
  isLoading = false, 
  onPress, 
  style, 
  disabled,
  ...props 
}: CustomButtonProps) {
  
  const getVariantStyle = () => {
    switch(variant) {
      case 'secondary': return styles.secondary;
      case 'outline': return styles.outline;
      case 'danger': return styles.danger;
      default: return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch(variant) {
      case 'outline': return styles.textOutline;
      default: return styles.textLight;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, getVariantStyle(), (disabled || isLoading) && styles.disabled, style]} 
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? '#1E3A8A' : '#ffffff'} />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 50,
  },
  primary: {
    backgroundColor: '#1E3A8A', // Azul fuerte
  },
  secondary: {
    backgroundColor: '#4B5563', // Gris oscuro
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  danger: {
    backgroundColor: '#EF4444', // Rojo alerta
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textLight: {
    color: '#ffffff',
  },
  textOutline: {
    color: '#1E3A8A',
  }
});
