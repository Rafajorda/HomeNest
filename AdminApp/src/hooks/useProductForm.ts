/**
 * ============================================================================
 * HOOK: useProductForm
 * ============================================================================
 * 
 * @description
 * Hook personalizado unificado para formularios de productos (crear Y editar).
 * Determina automáticamente el modo (creación/edición) según la presencia de
 * productId, carga datos existentes en modo edición, y maneja validación,
 * envío y navegación. Usa React Query para caching inteligente y mutations.
 * 
 * @features
 * - ✅ Modo dual: Crear O Editar (detectado automáticamente por productId)
 * - ✅ Carga automática de producto existente en modo edición
 * - ✅ Carga de categorías y colores con React Query (caching)
 * - ✅ Validación con Zod (CreateProductSchema o UpdateProductSchema)
 * - ✅ Mutations con React Query (invalidación automática de cache)
 * - ✅ Selección múltiple de categorías/colores con toggle
 * - ✅ Errores por campo con limpieza automática al editar
 * - ✅ Manejo de sesiones expiradas con redirección
 * - ✅ Navegación automática después de guardar
 * - ✅ Estados de carga independientes (form, product, options)
 * 
 * @architecture
 * ```
 * useProductForm (Custom Hook)
 *   ├─> React Query Hooks (queries & mutations)
 *   │   ├─> useProductQuery() - Cargar producto existente (solo en modo edit)
 *   │   ├─> useCategoriesQuery() - Cargar categorías (cacheado)
 *   │   ├─> useColorsQuery() - Cargar colores (cacheado)
 *   │   ├─> useCreateProductMutation() - Crear producto nuevo
 *   │   └─> useUpdateProductMutation() - Actualizar producto existente
 *   ├─> Zod Schemas (validación)
 *   │   ├─> CreateProductSchema - Validar en modo creación
 *   │   └─> UpdateProductSchema - Validar en modo edición
 *   ├─> useEffect - Cargar datos en formData cuando llega el producto
 *   └─> useRouter - Navegación después de guardar
 * ```
 * 
 * @mode_detection
 * ```
 * productId    │ Modo        │ Comportamiento
 * ─────────────┼─────────────┼─────────────────────────────
 * undefined    │ Creación   │ Formulario vacío, usar CreateProductSchema
 * "123"        │ Edición    │ Cargar producto, poblar form, usar UpdateProductSchema
 * ```
 * 
 * @params
 * @param {UseProductFormProps} [props] - Props opcionales del hook
 * @param {string} [props.productId] - ID del producto a editar (undefined = modo creación)
 * 
 * @returns {UseProductFormReturn} Hook con estado y funciones
 * @returns {CreateProductInput} formData - Datos del formulario actual
 * @returns {Function} setFormData - Setter directo del formulario
 * @returns {Category[]} categories - Categorías disponibles (desde React Query)
 * @returns {Color[]} colors - Colores disponibles (desde React Query)
 * @returns {boolean} isLoadingOptions - Cargando categorías/colores
 * @returns {boolean} isLoadingProduct - Cargando producto existente (solo edit mode)
 * @returns {boolean} isSubmitting - Envío en progreso (mutation pending)
 * @returns {string|null} error - Mensaje de error general
 * @returns {Record<string,string>} fieldErrors - Errores por campo
 * @returns {boolean} isEditMode - true si está en modo edición, false si creación
 * @returns {Product|undefined} product - Producto cargado (solo en modo edición)
 * @returns {Function} handleSubmit - Validar y enviar (crear o actualizar)
 * @returns {Function} handleCategoryToggle - Toggle selección de categoría
 * @returns {Function} handleColorToggle - Toggle selección de color
 * @returns {Function} updateField - Actualizar campo específico
 * 
 * @usage
 * ```typescript
 * // Ejemplo 1: Modo creación (sin productId)
 * function CreateProductScreen() {
 *   const {
 *     formData,
 *     updateField,
 *     categories,
 *     colors,
 *     isEditMode,  // false
 *     handleSubmit,
 *     isSubmitting,
 *   } = useProductForm(); // Sin productId = Modo creación
 *   
 *   return (
 *     <Form>
 *       <TextInput
 *         value={formData.name}
 *         onChangeText={(text) => updateField('name', text)}
 *       />
 *       <Button onPress={handleSubmit} loading={isSubmitting}>
 *         {isEditMode ? 'Actualizar' : 'Crear'} Producto
 *       </Button>
 *     </Form>
 *   );
 * }
 * 
 * // Ejemplo 2: Modo edición (con productId)
 * function EditProductScreen({ productId }: { productId: string }) {
 *   const {
 *     formData,
 *     updateField,
 *     categories,
 *     colors,
 *     isEditMode,  // true
 *     isLoadingProduct,  // true mientras carga el producto
 *     product,  // Producto original cargado
 *     handleSubmit,
 *     isSubmitting,
 *     error,
 *     fieldErrors,
 *   } = useProductForm({ productId }); // Con productId = Modo edición
 *   
 *   if (isLoadingProduct) return <Loading />;
 *   
 *   return (
 *     <Form>
 *       <TextInput
 *         value={formData.name}
 *         onChangeText={(text) => updateField('name', text)}
 *         error={fieldErrors.name}
 *       />
 *       <TextInput
 *         value={formData.price.toString()}
 *         onChangeText={(text) => updateField('price', parseFloat(text))}
 *         error={fieldErrors.price}
 *       />
 *       {error && <ErrorBanner message={error} />}
 *       <Button onPress={handleSubmit} loading={isSubmitting}>
 *         Actualizar Producto
 *       </Button>
 *     </Form>
 *   );
 * }
 * ```
 * 
 * @dependencies
 * - react: useState, useEffect
 * - expo-router: useRouter (navegación)
 * - react-query: Queries y mutations personalizadas
 * - ../hooks/queries: useProductQuery, useCategoriesQuery, etc.
 * - ../schemas/product.schema: CreateProductSchema, UpdateProductSchema
 * - ../types/product: Tipos de datos
 * 
 * @react_query_benefits
 * - Caching automático: categorías/colores se cargan 1 vez, luego se reusan
 * - Invalidación: mutations invalidan cache y recargan datos automáticamente
 * - Estados integrados: isLoading, isPending, error manejados por React Query
 * - Refetch inteligente: recarga datos cuando la ventana recupera foco
 * 
 * @validation
 * - Modo creación: CreateProductSchema.parse(formData)
 * - Modo edición: UpdateProductSchema.parse({ id, ...formData })
 * - ZodError mapea errores a fieldErrors por campo
 * - Validación en handleSubmit, no en tiempo real
 * 
 * @error_handling
 * - ZodError: errores de validación mapeados a fieldErrors
 * - API errors: seteados en error general
 * - Sesión expirada: muestra error y redirige a /login tras 2s
 * - Logs detallados con [useProductForm] prefix
 * 
 * @navigation
 * - Éxito (crear/editar): router.back() al dashboard
 * - Sesión expirada: router.replace('/login') tras 2s
 * 
 * @see {@link ./queries.ts} - React Query hooks personalizados
 * @see {@link ../schemas/product.schema.ts} - Schemas de validación Zod
 * 
 * ============================================================================
 */

// ============================================================================
// IMPORTS: Dependencias externas y tipos
// ============================================================================
import { useState, useEffect } from 'react'; // Hooks de React
import { useRouter } from 'expo-router'; // Router para navegación automática
import { CreateProductInput } from '../types/product'; // Tipo del formulario
import { Category, Color } from '../types/product'; // Tipos de opciones
import { CreateProductSchema, UpdateProductSchema } from '../schemas/product.schema'; // Schemas Zod
import {
  useProductQuery,              // Query: cargar 1 producto por ID
  useCreateProductMutation,     // Mutation: crear producto nuevo
  useUpdateProductMutation,     // Mutation: actualizar producto existente
  useCategoriesQuery,           // Query: cargar todas las categorías
  useColorsQuery,               // Query: cargar todos los colores
} from './queries'; // Hooks personalizados de React Query

// ============================================================================
// TYPES: Interfaces del hook
// ============================================================================

/**
 * Props del hook useProductForm
 */
interface UseProductFormProps {
  productId?: string; // ID del producto a editar (undefined = modo creación)
}

/**
 * Retorno del hook useProductForm
 */
interface UseProductFormReturn {
  // === DATOS DEL FORMULARIO ===
  formData: CreateProductInput;  // Objeto con todos los datos del form
  setFormData: React.Dispatch<React.SetStateAction<CreateProductInput>>;  // Setter directo
  
  // === OPCIONES DISPONIBLES (cargadas con React Query) ===
  categories: Category[];        // Categorías seleccionables
  colors: Color[];               // Colores seleccionables
  isLoadingOptions: boolean;     // Cargando categorías/colores
  isLoadingProduct: boolean;     // Cargando producto existente (solo edit mode)
  
  // === ESTADOS DE UI ===
  isSubmitting: boolean;         // Envío en progreso (mutation pending)
  error: string | null;          // Error general (API, red, etc)
  fieldErrors: Record<string, string>;  // Errores por campo individual
  
  // === MODO Y DATOS ===
  isEditMode: boolean;           // true = edición, false = creación
  product?: any;                 // Producto original cargado (solo en edit mode)
  
  // === ACCIONES ===
  handleSubmit: () => Promise<void>;  // Validar y enviar (crear o actualizar)
  handleCategoryToggle: (categoryId: string) => void;  // Toggle categoría
  handleColorToggle: (colorId: string) => void;        // Toggle color
  updateField: <K extends keyof CreateProductInput>(field: K, value: CreateProductInput[K]) => void;  // Actualizar campo
}

// ============================================================================
// CONSTANTES: Valores iniciales del formulario
// ============================================================================
const initialFormData: CreateProductInput = {
  name: '',           // Nombre del producto
  description: '',    // Descripción detallada
  material: '',       // Material del producto
  price: 0,           // Precio en euros
  dimensions: '',     // Dimensiones físicas
  imageUrl: '',       // URL de la imagen
  imageAlt: '',       // Texto alternativo de imagen
  categoryIds: [],    // IDs de categorías seleccionadas
  colorIds: [],       // IDs de colores seleccionados
};

// ============================================================================
// HOOK PRINCIPAL: useProductForm
// ============================================================================
export const useProductForm = ({ productId }: UseProductFormProps = {}): UseProductFormReturn => {
  // === PASO 1: Inicialización y detección de modo ===
  
  // Router para navegación automática después de guardar
  const router = useRouter();
  
  // Detectar modo: true si hay productId (edición), false si no hay (creación)
  const isEditMode = !!productId;
  // Ejemplos:
  // - useProductForm() → isEditMode = false (creación)
  // - useProductForm({ productId: '123' }) → isEditMode = true (edición)
  
  // === PASO 2: React Query hooks ===
  
  // Query: Cargar producto existente (SOLO si estamos en modo edición)
  const { data: product, isLoading: isLoadingProduct } = useProductQuery(productId || '', {
    enabled: !!productId,  // Solo ejecutar query si hay productId
    // enabled: false → query no se ejecuta (modo creación)
  });
  
  // Query: Cargar categorías disponibles (cacheado por React Query)
  const { data: categories = [], isLoading: isLoadingCategories } = useCategoriesQuery();
  // = [] → default a array vacío si data es undefined
  
  // Query: Cargar colores disponibles (cacheado por React Query)
  const { data: colors = [], isLoading: isLoadingColors } = useColorsQuery();
  
  // Mutation: Crear producto nuevo
  const createMutation = useCreateProductMutation();
  // createMutation.mutateAsync() → envía POST /products
  
  // Mutation: Actualizar producto existente
  const updateMutation = useUpdateProductMutation();
  // updateMutation.mutateAsync() → envía PUT /products/:id
  
  // === PASO 3: Estados del formulario ===
  
  // Estado: Datos del formulario (inicializado vacío, se puebla con useEffect)
  const [formData, setFormData] = useState<CreateProductInput>(initialFormData);
  
  // === PASO 4: Estados de UI y errores ===
  
  // Estado: Mensaje de error general (errores de API, red, etc)
  const [error, setError] = useState<string | null>(null);
  
  // Estado: Errores específicos por campo (validación Zod)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // === PASO 5: Estados computados/derivados ===
  
  // Computed: Indica si está cargando categorías O colores
  const isLoadingOptions = isLoadingCategories || isLoadingColors;
  // true si cualquiera de las queries está cargando
  
  // Computed: Indica si hay un envío en progreso (crear O actualizar)
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  // isPending es provisto por React Query (true durante mutation)

  // ============================================================================
  // EFECTO: Poblar formulario con datos del producto (modo edición)
  // ============================================================================
  /**
   * Efecto que carga los datos del producto en el formulario cuando:
   * 1. El producto ya fue cargado por React Query (product existe)
   * 2. Estamos en modo edición (isEditMode = true)
   * 
   * Mapea los datos del producto al formato del formulario.
   */
  useEffect(() => {
    // === GUARD: Solo ejecutar si hay producto y estamos en modo edición ===
    if (product && isEditMode) {
      // === Mapear datos del producto al formulario ===
      setFormData({
        name: product.name,                           // Nombre directo
        description: product.description,             // Descripción directa
        material: product.material || '',             // Material (default '' si null)
        price: product.price,                         // Precio directo
        dimensions: product.dimensions || '',         // Dimensiones (default '' si null)
        imageUrl: product.images?.[0]?.src || '',     // URL de primera imagen (optional chaining)
        imageAlt: product.images?.[0]?.alt || '',     // Alt de primera imagen
        categoryIds: product.categories.map(c => c.id),  // Extraer solo IDs de categorías
        colorIds: product.colors.map(c => c.id),         // Extraer solo IDs de colores
      });
      // Ahora el formulario muestra los datos existentes del producto
    }
  }, [product, isEditMode]); // Re-ejecutar cuando cambia el producto o el modo
  // Nota: Se ejecuta DESPUÉS de que React Query carga el producto

  // ============================================================================
  // FUNCIÓN: updateField - Actualizar campo del formulario
  // ============================================================================
  /**
   * Actualiza el valor de un campo específico del formulario.
   * Limpia automáticamente el error de ese campo si existe.
   * 
   * @template K - Nombre del campo (type-safe)
   * @param {K} field - Campo a actualizar
   * @param {CreateProductInput[K]} value - Nuevo valor
   */
  const updateField = <K extends keyof CreateProductInput>(
    field: K,
    value: CreateProductInput[K]
  ) => {
    // === PASO 1: Actualizar valor en formData ===
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // === PASO 2: Limpiar error del campo si existe ===
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];  // Eliminar mensaje de error de este campo
        return newErrors;
      });
    }
  };

  // ============================================================================
  // FUNCIÓN: handleCategoryToggle - Toggle selección de categoría
  // ============================================================================
  /**
   * Alterna la selección de una categoría (agregar/quitar del array).
   * Si está seleccionada la remueve, si no está la agrega.
   * 
   * @param {string} categoryId - ID de la categoría a togglear
   */
  const handleCategoryToggle = (categoryId: string) => {
    // === PASO 1: Actualizar array de categoryIds ===
    setFormData(prev => {
      // Verificar si la categoría ya está seleccionada
      const isSelected = prev.categoryIds.includes(categoryId);
      
      return {
        ...prev,  // Mantener todos los demás campos
        categoryIds: isSelected
          // Caso 1: Ya está seleccionada → removerla
          ? prev.categoryIds.filter(id => id !== categoryId)
          // Caso 2: No está seleccionada → agregarla
          : [...prev.categoryIds, categoryId],
      };
    });
    
    // === PASO 2: Limpiar error de categorías si existe ===
    if (fieldErrors.categoryIds) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.categoryIds;  // Quitar "Selecciona al menos 1 categoría"
        return newErrors;
      });
    }
  };

  // ============================================================================
  // FUNCIÓN: handleColorToggle - Toggle selección de color
  // ============================================================================
  /**
   * Alterna la selección de un color (agregar/quitar del array).
   * Si está seleccionado lo remueve, si no está lo agrega.
   * 
   * @param {string} colorId - ID del color a togglear
   */
  const handleColorToggle = (colorId: string) => {
    // === PASO 1: Actualizar array de colorIds ===
    setFormData(prev => {
      // Verificar si el color ya está seleccionado
      const isSelected = prev.colorIds.includes(colorId);
      
      return {
        ...prev,  // Mantener todos los demás campos
        colorIds: isSelected
          // Caso 1: Ya está seleccionado → removerlo
          ? prev.colorIds.filter(id => id !== colorId)
          // Caso 2: No está seleccionado → agregarlo
          : [...prev.colorIds, colorId],
      };
    });
    
    // === PASO 2: Limpiar error de colores si existe ===
    if (fieldErrors.colorIds) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.colorIds;  // Quitar "Selecciona al menos 1 color"
        return newErrors;
      });
    }
  };

  // ============================================================================
  // FUNCIÓN: handleSubmit - Enviar formulario (crear o actualizar)
  // ============================================================================
  /**
   * Valida y envía el formulario usando la mutation apropiada según el modo.
   * - Modo creación: usa CreateProductSchema y createMutation
   * - Modo edición: usa UpdateProductSchema y updateMutation
   * 
   * Maneja errores de validación, API y sesión expirada.
   */
  const handleSubmit = async () => {
    try {
      // === PASO 1: Limpiar errores previos ===
      setError(null);           // Limpiar error general
      setFieldErrors({});       // Limpiar errores de campos

      // === PASO 2: Determinar modo y validar/enviar ===
      
      if (isEditMode && productId) {
        // === MODO EDICIÓN ===
        
        // Validar con UpdateProductSchema (incluye ID)
        const validatedData = UpdateProductSchema.parse({ id: productId, ...formData });
        // UpdateProductSchema valida campos + requiere ID
        
        // Extraer ID del data (API no lo necesita en body)
        const { id, ...dataWithoutId } = validatedData;
        
        // Ejecutar mutation de actualización
        await updateMutation.mutateAsync({
          id: productId,           // ID en URL params
          data: dataWithoutId,     // Datos en body (sin ID)
        });
        // React Query invalida cache automáticamente después de success
      } else {
        // === MODO CREACIÓN ===
        
        // Validar con CreateProductSchema (sin ID)
        const validatedData = CreateProductSchema.parse(formData);
        
        // Ejecutar mutation de creación
        await createMutation.mutateAsync(validatedData);
        // POST /products con datos validados
      }
      
      // === PASO 3: Navegación exitosa ===
      router.back();
      // Volver al dashboard de productos
      // El nuevo/actualizado producto debería aparecer en la lista
    } catch (err: any) {
      // === MANEJO DE ERRORES ===
      console.error('[useProductForm] Error submitting:', err);
      
      // === CASO 1: Error de validación Zod ===
      if (err.name === 'ZodError') {
        const errors: Record<string, string> = {};
        console.log('[useProductForm] Validation errors:', err.errors);
        
        // Mapear errores de Zod a objeto { campo: mensaje }
        err.errors.forEach((error: any) => {
          const field = error.path[0];     // Nombre del campo con error
          errors[field] = error.message;   // Mensaje del error
          console.log(`[useProductForm] Field error - ${field}:`, error.message);
        });
        
        // Guardar errores por campo
        setFieldErrors(errors);
        
        // Crear mensaje general con lista de campos erróneos
        const errorFields = Object.keys(errors).join(', ');
        setError(`Por favor corrige los errores en: ${errorFields}`);
        // Ejemplo: "Por favor corrige los errores en: name, price, categoryIds"
      } 
      // === CASO 2: Otros errores (API, red, sesión) ===
      else {
        // === SUBCASO 2.1: Sesión expirada ===
        if (err.message?.includes('sesión ha expirado')) {
          setError(err.message); // Mostrar mensaje de sesión expirada
          
          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            router.replace('/login');
            // replace() elimina historial (no puede volver atrás)
          }, 2000);
        } 
        // === SUBCASO 2.2: Otros errores de API/red ===
        else {
          // Mensaje dinámico según modo (crear vs actualizar)
          setError(err.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el producto`);
        }
      }
    }
  };

  // ============================================================================
  // RETORNO: API pública del hook
  // ============================================================================
  return {
    // === DATOS DEL FORMULARIO ===
    formData,         // CreateProductInput: datos actuales del formulario
    setFormData,      // Setter directo (para casos especiales)
    
    // === OPCIONES DISPONIBLES ===
    categories,       // Category[]: categorías cargadas con React Query
    colors,           // Color[]: colores cargados con React Query
    isLoadingOptions, // boolean: true si carga categorías/colores
    isLoadingProduct, // boolean: true si carga producto existente (edit mode)
    
    // === ESTADOS DE UI ===
    isSubmitting,     // boolean: true durante mutation (crear o actualizar)
    error,            // string | null: mensaje de error general
    fieldErrors,      // Record<string, string>: errores por campo individual
    
    // === MODO Y DATOS ===
    isEditMode,       // boolean: true = edición, false = creación
    product,          // Product | undefined: producto original cargado (solo edit)
    
    // === ACCIONES ===
    handleSubmit,          // () => Promise<void>: validar y enviar (create/update)
    handleCategoryToggle,  // (id: string) => void: toggle categoría
    handleColorToggle,     // (id: string) => void: toggle color
    updateField,           // <K>(field: K, value: any) => void: actualizar campo
  };
};
