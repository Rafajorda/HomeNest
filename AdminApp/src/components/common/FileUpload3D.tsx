/**
 * Componente FileUpload3D
 * 
 * Permite seleccionar y subir archivos .glb (modelos 3D)
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { getStyles } from './FileUpload3D.styles';

interface FileUpload3DProps {
  onFileSelected: (file: DocumentPicker.DocumentPickerAsset) => void;
  onDelete?: () => void;
  currentModelUrl?: string;
  disabled?: boolean;
  isUploading?: boolean;
  isDeleting?: boolean;
}

export const FileUpload3D = ({ 
  onFileSelected, 
  onDelete,
  currentModelUrl, 
  disabled,
  isUploading = false,
  isDeleting = false,
}: FileUpload3DProps) => {
  const [uploading, setUploading] = useState(false);
  const theme = useTheme();
  const styles = getStyles(theme);

  const isProcessing = uploading || isUploading || isDeleting;

  const pickDocument = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Acepta todos los archivos, validamos por extensión
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setUploading(false);
        return;
      }

      const file = result.assets[0];
      
      // Validar extensión .glb
      if (!file.name.toLowerCase().endsWith('.glb')) {
        Alert.alert('Error', 'Solo se permiten archivos .glb');
        setUploading(false);
        return;
      }

      // Validar tamaño (máx 50MB)
      const maxSize = 50 * 1024 * 1024;
      if (file.size && file.size > maxSize) {
        Alert.alert('Error', 'El archivo es demasiado grande. Máximo 50MB');
        setUploading(false);
        return;
      }

      onFileSelected(file);
      setUploading(false);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Error al seleccionar archivo');
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="labelLarge" style={styles.label}>
        Modelo 3D (.glb)
      </Text>
      
      <TouchableOpacity
        style={[styles.uploadButton, (disabled || isProcessing) && styles.uploadButtonDisabled]}
        onPress={pickDocument}
        disabled={disabled || isProcessing}
        activeOpacity={0.7}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <IconButton
              icon="cube-outline"
              size={24}
              iconColor="#fff"
              style={styles.icon}
            />
            <Text style={styles.uploadButtonText}>
              {currentModelUrl ? 'Cambiar modelo 3D' : 'Subir modelo 3D'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {currentModelUrl && (
        <View style={styles.currentFileContainer}>
          <IconButton
            icon="checkmark-circle"
            size={20}
            iconColor="#4CAF50"
            style={styles.checkIcon}
          />
          <Text style={styles.currentFileText}>Modelo cargado</Text>
          {onDelete && (
            <IconButton
              icon="delete"
              size={20}
              iconColor="#f44336"
              onPress={onDelete}
              disabled={isDeleting}
            />
          )}
        </View>
      )}

      <Text style={styles.hint}>
        Formato: .glb • Tamaño máximo: 50MB
      </Text>
    </View>
  );
};
