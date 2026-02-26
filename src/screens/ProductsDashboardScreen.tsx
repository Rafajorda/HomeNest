/**
 * ========================================
 * PANTALLA: ProductsDashboardScreen
 * ========================================
 * 
 * DESCRIPCIÓN:
 * Pantalla principal de gestión de productos del panel de administración.
 * Lista todos los productos con funcionalidades completas de CRUD.
 * 
 * FUNCIONALIDADES:
 * - Lista de productos con búsqueda en tiempo real
 * - Crear nuevo producto (FAB + botón en vacío)
 * - Editar producto existente (botón lápiz en card)
 * - Eliminar producto con confirmación (botón papelera)
 * - Toggle estado activo/inactivo (botón ojo)
 * - Generar etiqueta con QR code (botón qrcode)
 * - Escanear QR para buscar productos (botón en appbar)
 * - Refrescar lista con pull-to-refresh
 * - Auto-refresh cuando la pantalla obtiene foco
 * 
 * COMPONENTES UTILIZADOS:
 * - ProductCard: Tarjeta individual de cada producto
 * - ProductListHeader: Barra de búsqueda y contador
 * - ProductLabel: Modal con etiqueta QR para imprimir
 * - QRScanner: Modal para escanear códigos QR
 * 
 * NAVEGACIÓN:
 * - /create-product: Formulario de creación
 * - /edit-product/[id]: Formulario de edición
 * - /dashboard: Volver al dashboard principal
 * 
 * ESTADO:
 * - searchQuery: Texto de búsqueda
 * - selectedProduct: Producto para generar etiqueta
 * - showScanner: Control de visibilidad del escáner
 * - deleteDialogVisible: Control del diálogo de confirmación
 * - productToDelete: Producto en proceso de eliminación
 */

// ===== IMPORTS DE REACT =====
import React, { useState } from 'react'; // Biblioteca principal de React
// ===== IMPORTS DE REACT NATIVE =====
import { View, StyleSheet, FlatList, RefreshControl, Modal, Alert } from 'react-native'; // Componentes básicos
// ===== IMPORTS DE REACT NATIVE PAPER =====
import {
  FAB, // Floating Action Button para crear producto
  ActivityIndicator, // Spinner de carga
  Appbar, // Barra superior de navegación
  Button, // Botones de Material Design
  Text, // Texto con variantes MD3
  Portal, // Portal para diálogos
  Dialog, // Diálogo de confirmación
  useTheme, // Hook para obtener tema actual
} from 'react-native-paper';
// ===== IMPORTS DE EXPO ROUTER =====
import { useRouter } from 'expo-router'; // Hook de navegación
import { useFocusEffect } from 'expo-router'; // Hook para detectar cuando la pantalla obtiene foco
// ===== IMPORTS DE REACT QUERY =====
import { 
  useProductsQuery, // Hook para obtener lista de productos
  useDeleteProductMutation, // Hook para eliminar producto
  useToggleProductStatusMutation, // Hook para cambiar estado activo/inactivo
} from '../hooks/queries';
// ===== IMPORTS DE TIPOS =====
import { Product } from '../types/product'; // Interfaz TypeScript del producto
// ===== IMPORTS DE COMPONENTES =====
import { ProductCard, ProductListHeader, ProductLabel, QRScanner } from '../components/products'; // Componentes de productos

/**
 * Componente principal de la pantalla de productos
 * 
 * Gestiona toda la lógica de la lista de productos, búsqueda,
 * CRUD completo y generación de etiquetas QR.
 * 
 * @returns {JSX.Element} Pantalla de dashboard de productos
 */
export const ProductsDashboardScreen = () => {
  // Hook de navegación para router.push/replace
  const router = useRouter();
  
  // Hook para obtener el tema actual (light/dark)
  const theme = useTheme();
  
  // Generar estilos dinámicos basados en el tema
  const styles = getStyles(theme);
  
  // ===== REACT QUERY HOOKS =====
  // Hook para obtener la lista de productos desde el backend
  const { data: products = [], isLoading, refetch, isRefetching } = useProductsQuery();
  
  // Mutation para eliminar un producto
  const deleteProductMutation = useDeleteProductMutation();
  
  // Mutation para cambiar el estado activo/inactivo de un producto
  const toggleStatusMutation = useToggleProductStatusMutation();

  // ===== ESTADO LOCAL =====
  // Texto de búsqueda ingresado por el usuario
  const [searchQuery, setSearchQuery] = useState('');
  
  // Producto seleccionado para generar etiqueta QR
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Control de visibilidad del modal de escáner QR
  const [showScanner, setShowScanner] = useState(false);
  
  // Control de visibilidad del diálogo de confirmación de eliminación
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  
  // Producto que está siendo eliminado (ID y nombre para el mensaje)
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  /**
   * EFECTO: Refrescar lista cuando la pantalla obtiene el foco
   * 
   * Cada vez que el usuario navega de regreso a esta pantalla
   * (por ejemplo, después de crear o editar un producto),
   * se refresca automáticamente la lista.
   */
  useFocusEffect(
    React.useCallback(() => {
      refetch(); // Llamar a React Query para refrescar
    }, [refetch])
  );

  /**
   * COMPUTED: Productos filtrados por búsqueda
   * 
   * Si hay texto en searchQuery, filtra los productos por nombre o descripción.
   * Si no hay texto, devuelve todos los productos.
   */
  const filteredProducts = searchQuery.trim()
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || // Buscar en nombre
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) // Buscar en descripción
      )
    : products; // Sin filtro si searchQuery está vacío

  // ===== HANDLERS =====
  
  /**
   * HANDLER: Búsqueda de productos
   * 
   * Actualiza el estado searchQuery cuando el usuario escribe en el input.
   * El filtrado se hace automáticamente en filteredProducts.
   * 
   * @param {string} query - Texto ingresado en el campo de búsqueda
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  /**
   * HANDLER: Crear nuevo producto
   * 
   * Navega a la pantalla de formulario de creación de producto.
   */
  const handleCreateProduct = () => {
    router.push('/create-product');
  };

  /**
   * HANDLER: Editar producto existente
   * 
   * Navega a la pantalla de edición con el ID del producto.
   * 
   * @param {string} id - ID del producto a editar
   */
  const handleEditProduct = (id: string) => {
    router.push(`/edit-product/${id}`);
  };

  /**
   * HANDLER: Iniciar eliminación de producto
   * 
   * Guarda el producto a eliminar y abre el diálogo de confirmación.
   * No elimina directamente, espera confirmación del usuario.
   * 
   * @param {string} id - ID del producto
   * @param {string} name - Nombre del producto (para mostrar en el diálogo)
   */
  const handleDeleteProduct = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setDeleteDialogVisible(true);
  };

  /**
   * HANDLER: Confirmar y ejecutar eliminación
   * 
   * Ejecuta la mutation de eliminación después de la confirmación.
   * Muestra alertas de éxito o error según el resultado.
   * 
   * @async
   */
  const confirmDelete = async () => {
    if (!productToDelete) return; // No hacer nada si no hay producto seleccionado

    try {
      // Llamar a la mutation de React Query
      await deleteProductMutation.mutateAsync(productToDelete.id);
      Alert.alert('Éxito', 'Producto eliminado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el producto');
    } finally {
      // Cerrar el diálogo y limpiar el estado
      setDeleteDialogVisible(false);
      setProductToDelete(null);
    }
  };

  /**
   * HANDLER: Toggle estado activo/inactivo
   * 
   * Cambia el estado del producto entre activo e inactivo.
   * La mutation de React Query se encarga de actualizar la lista automáticamente.
   * 
   * @async
   * @param {string} id - ID del producto
   */
  const handleToggleStatus = async (id: string) => {
    try {
      // Llamar a la mutation para cambiar el estado
      await toggleStatusMutation.mutateAsync(id);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado del producto');
    }
  };

  /**
   * HANDLER: Generar etiqueta QR
   * 
   * Abre el modal con la etiqueta QR del producto seleccionado.
   * 
   * @param {Product} product - Producto completo para generar la etiqueta
   */
  const handleGenerateLabel = (product: Product) => {
    setSelectedProduct(product);
  };

  /**
   * HANDLER: Cerrar modal de etiqueta
   * 
   * Cierra el modal de etiqueta limpiando el producto seleccionado.
   */
  const handleCloseLabelModal = () => {
    setSelectedProduct(null);
  };

  /**
   * HANDLER: Abrir escáner QR
   * 
   * Abre el modal de escáner de códigos QR para buscar productos.
   */
  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  /**
   * HANDLER: Cerrar escáner QR
   * 
   * Cierra el modal de escáner de códigos QR.
   */
  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  /**
   * Renderiza cada producto en la lista
   */
  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onEdit={handleEditProduct}
      onToggleStatus={handleToggleStatus}
      onDelete={handleDeleteProduct}
      onGenerateLabel={handleGenerateLabel}
    />
  );

  /**
   * Footer de la lista con indicador de carga
   */
  const renderFooter = () => {
    if (!isRefetching || products.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  /**
   * Placeholder cuando no hay productos
   */
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No hay productos
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          {searchQuery
            ? 'No se encontraron productos con ese criterio'
            : 'Comienza creando tu primer producto'}
        </Text>
        {!searchQuery && (
          <Button
            mode="contained"
            onPress={handleCreateProduct}
            style={styles.emptyButton}
          >
            Crear Producto
          </Button>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Appbar */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.push('/dashboard')} />
        <Appbar.Content title="Productos" />
        <Appbar.Action icon="qrcode-scan" onPress={handleOpenScanner} />
      </Appbar.Header>

      {/* Header con búsqueda y contador */}
      <ProductListHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        totalCount={filteredProducts.length}
      />

      {/* Lista de productos */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />

      {/* Botón flotante para crear producto */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateProduct}
        label="Nuevo Producto"
      />

      {/* Diálogo de confirmación de eliminación */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Confirmar eliminación</Dialog.Title>
          <Dialog.Content>
            <Text>¿Estás seguro de que quieres eliminar "{productToDelete?.name}"?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancelar</Button>
            <Button onPress={confirmDelete} loading={deleteProductMutation.isPending}>
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Modal de etiqueta del producto */}
      <Modal
        visible={!!selectedProduct}
        transparent
        animationType="fade"
        onRequestClose={handleCloseLabelModal}
      >
        {selectedProduct && (
          <ProductLabel
            product={selectedProduct}
            onClose={handleCloseLabelModal}
          />
        )}
      </Modal>

      {/* Modal de escáner QR */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={handleCloseScanner}
      >
        <QRScanner onClose={handleCloseScanner} />
      </Modal>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginBottom: 8,
    color: theme.colors.onBackground,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});
