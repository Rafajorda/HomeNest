/**
 * Ruta de creación de producto
 */

import { Stack } from 'expo-router';
import ProductFormScreen from '../screens/ProductFormScreen';

export default function CreateProductRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Crear Producto',
          headerShown: true,
        }}
      />
      <ProductFormScreen />
    </>
  );
}
