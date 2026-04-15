/**
 * Ruta de edición de producto
 */

import { Stack, useLocalSearchParams } from 'expo-router';
import ProductFormScreen from '../../screens/ProductFormScreen';

export default function EditProductRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Editar Producto',
          headerShown: true,
        }}
      />
      <ProductFormScreen productId={id} />
    </>
  );
}
