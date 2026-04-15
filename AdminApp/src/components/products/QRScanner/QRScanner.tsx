/**
 * Componente QRScanner
 * 
 * Escanea códigos QR y redirige al producto correspondiente
 */

import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Text, Button, Surface, IconButton, useTheme } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { getStyles } from './QRScanner.styles';

interface QRScannerProps {
  onClose: () => void;
}

export const QRScanner = ({ onClose }: QRScannerProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme);

  /**
   * Maneja el escaneo del QR
   * Acepta varios formatos:
   * - Solo el ID: "123" o "c36ac782-ff9b-4fce-91f2-17eaa4c90dc4"
   * - Deep link: "myapp://product/123"
   * - URL HTTP: "http://localhost:3000/product/123"
   */
  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    console.log('[QRScanner] QR escaneado:', data);
    
    let productId: string | null = null;

    try {
      const trimmedData = data.trim();
      
      // Caso 1: Solo el ID (numérico o UUID)
      // UUID: c36ac782-ff9b-4fce-91f2-17eaa4c90dc4
      // ID numérico: 123
      if (/^[a-f0-9-]+$/i.test(trimmedData) || /^\d+$/.test(trimmedData)) {
        productId = trimmedData;
      }
      // Caso 2: Deep link (myapp://product/123)
      else if (trimmedData.startsWith('myapp://product/')) {
        productId = trimmedData.split('myapp://product/')[1].split('?')[0].split('#')[0].trim();
      }
      // Caso 3: URL HTTP/HTTPS (http://localhost:3000/product/123)
      else if (trimmedData.startsWith('http://') || trimmedData.startsWith('https://')) {
        const url = new URL(trimmedData);
        const pathParts = url.pathname.split('/');
        const productIndex = pathParts.indexOf('product');
        
        if (productIndex !== -1 && pathParts[productIndex + 1]) {
          productId = pathParts[productIndex + 1].trim();
        }
      }

      console.log('[QRScanner] ID extraído:', productId);

      // Validar que sea un ID numérico o UUID válido
      const isNumericId = /^\d+$/.test(productId || '');
      const isUUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(productId || '');

      if (productId && (isNumericId || isUUID)) {
        console.log('[QRScanner] Navegando a producto:', productId);
        onClose();
        // Navegar a la página de edición del producto
        router.push(`/edit-product/${productId}`);
      } else {
        console.log('[QRScanner] ID inválido:', productId);
        Alert.alert('Error', `Código QR inválido: "${data}"\nDebe contener un ID de producto válido.`);
        setScanned(false);
      }
    } catch (error) {
      console.error('[QRScanner] Error parsing QR:', error);
      Alert.alert('Error', 'No se pudo leer el código QR');
      setScanned(false);
    }
  };

  // Solicitar permisos al montar
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  // Si no hay permisos
  if (!permission) {
    return (
      <View style={styles.container}>
        <Surface style={styles.surface}>
          <Text>Solicitando permisos de cámara...</Text>
        </Surface>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Surface style={styles.surface}>
          <Text variant="titleMedium" style={styles.title}>
            Permiso de cámara requerido
          </Text>
          <Text style={styles.message}>
            Esta app necesita acceso a tu cámara para escanear códigos QR
          </Text>
          <View style={styles.actions}>
            <Button mode="outlined" onPress={onClose}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={requestPermission}>
              Dar permiso
            </Button>
          </View>
        </Surface>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con botón de cerrar */}
      <View style={styles.header}>
        <IconButton
          icon="close"
          iconColor="white"
          size={28}
          onPress={onClose}
          style={styles.closeButton}
        />
      </View>

      {/* Cámara */}
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Overlay con instrucciones */}
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          
          <View style={styles.middleContainer}>
            <View style={styles.sideOverlay} />
            <View style={styles.scanFrame} />
            <View style={styles.sideOverlay} />
          </View>
          
          <View style={styles.bottomOverlay}>
            <Text style={styles.instruction}>
              {scanned ? 'Procesando...' : 'Apunta al código QR del producto'}
            </Text>
            {scanned && (
              <Button
                mode="outlined"
                onPress={() => setScanned(false)}
                style={styles.rescanButton}
                textColor="white"
              >
                Escanear otro
              </Button>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
};
