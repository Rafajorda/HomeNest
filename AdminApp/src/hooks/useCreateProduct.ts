/**
 * ============================================================================
 * HOOK: useCreateProduct
 * ============================================================================
 * 
 * @description
 * Hook personalizado para gestionar el flujo completo de creación de productos.
 * Encapsula el estado del formulario, validación con Zod, carga de opciones
 * (categorías y colores), y envío a la API. Proporciona una interfaz limpia
 * para componentes de creación de productos sin lógica compleja.
 * 
 * @features
 * - ✅ Formulario completo con todos los campos de producto
 * - ✅ Carga automática de categorías y colores disponibles
 * - ✅ Selección múltiple de categorías/colores con toggle
 * - ✅ Validación con Zod schema antes de enviar
 * - ✅ Errores por campo individual (field-level errors)
 * - ✅ Limpieza automática de errores al editar campos
 * - ✅ Manejo de sesiones expiradas con redirección automática
 * - ✅ Navegación automática al dashboard después de crear
 * - ✅ Estados de carga independientes (form, options)
 * 
 * @architecture
 * ```
 * useCreateProduct (Custom Hook)
 *   ├─> productService.createProduct() - Enviar datos a API
 *   ├─> categoryService.getCategories() - Cargar opciones
 *   ├─> colorService.getColors() - Cargar opciones
 *   ├─> CreateProductSchema (Zod) - Validación de datos
 *   ├─> useRouter (Expo) - Navegación automática
 *   └─> useEffect - Carga inicial de opciones
 * ```
 * 
 * @form_structure
 * ```
 * Campo            │ Tipo       │ Validación             │ Requerido
 * ─────────────────┼────────────┼──────────────────────────┼───────────
 * name             │ string     │ Min 3 chars            │ ✅
 * description      │ string     │ Min 10 chars           │ ✅
 * material         │ string     │ Min 3 chars            │ ✅
 * price            │ number     │ > 0                    │ ✅
 * dimensions       │ string     │ Min 3 chars            │ ✅
 * imageUrl         │ string     │ Valid URL              │ ✅
 * imageAlt         │ string     │ Min 3 chars            │ ✅
 * categoryIds      │ string[]   │ Min 1 categoría       │ ✅
 * colorIds         │ string[]   │ Min 1 color            │ ✅
 * ```
 * 
 * @returns {UseCreateProductReturn} Hook con estado y funciones
 * @returns {CreateProductInput} formData - Datos del formulario actual
 * @returns {Function} setFormData - Setter directo del formulario completo
 * @returns {Category[]} categories - Array de categorías disponibles
 * @returns {Color[]} colors - Array de colores disponibles
 * @returns {boolean} isLoadingOptions - Indica si aún carga categorías/colores
 * @returns {boolean} isSubmitting - Indica si hay envío en progreso
 * @returns {string|null} error - Mensaje de error general
 * @returns {Record<string,string>} fieldErrors - Errores por campo individual
 * @returns {Function} handleSubmit - Función async para enviar formulario
 * @returns {Function} handleCategoryToggle - Toggle selección de categoría
 * @returns {Function} handleColorToggle - Toggle selección de color
 * @returns {Function} updateField - Actualiza un campo específico del form
 * 
 * @usage
 * ```typescript
 * // Ejemplo 1: Uso básico en pantalla de crear producto
 * function CreateProductScreen() {
 *   const {
 *     formData,
 *     updateField,
 *     categories,
 *     colors,
 *     isLoadingOptions,
 *     isSubmitting,
 *     error,
 *     fieldErrors,
 *     handleSubmit,
 *     handleCategoryToggle,
 *     handleColorToggle,
 *   } = useCreateProduct();
 *   
 *   return (
 *     <ScrollView>
 *       <TextInput
 *         value={formData.name}
 *         onChangeText={(text) => updateField('name', text)}
 *         error={fieldErrors.name}
 *       />
 *       <TextInput
 *         value={formData.description}
 *         onChangeText={(text) => updateField('description', text)}
 *         error={fieldErrors.description}
 *       />
 *       <NumberInput
 *         value={formData.price}
 *         onChangeValue={(val) => updateField('price', val)}
 *         error={fieldErrors.price}
 *       />
 *       <CategorySelector
 *         categories={categories}
 *         selected={formData.categoryIds}
 *         onToggle={handleCategoryToggle}
 *       />
 *       <ColorSelector
 *         colors={colors}
 *         selected={formData.colorIds}
 *         onToggle={handleColorToggle}
 *       />
 *       {error && <Text style={styles.error}>{error}</Text>}
 *       <Button
 *         onPress={handleSubmit}
 *         loading={isSubmitting}
 *         disabled={isLoadingOptions}
 *       >
 *         Crear Producto
 *       </Button>
 *     </ScrollView>
 *   );
 * }
 * ```
 * 
 * @dependencies
 * - react: useState, useEffect
 * - expo-router: useRouter (navegación automática)
 * - ../services/productService: createProduct
 * - ../services/categoryService: getCategories
 * - ../services/colorService: getColors
 * - ../schemas/product.schema: CreateProductSchema (Zod)
 * - ../types/product: Tipos de datos
 * 
 * @validation
 * - Usa Zod para validación antes de enviar a API
 * - CreateProductSchema.parse() lanza ZodError si hay errores
 * - Errores se mapean a fieldErrors { campo: mensaje }
 * - La validación sucede en handleSubmit(), no en tiempo real
 * 
 * @error_handling
 * - ZodError: mapea errores a fieldErrors por campo
 * - API errors: setea error general
 * - Sesión expirada: muestra error y redirige a /login después de 2s
 * - Limpieza automática de errores al editar campos
 * 
 * @navigation
 * - Éxito: router.back() vuelve al dashboard
 * - Sesión expirada: router.replace('/login') después de 2s
 * 
 * ============================================================================
 */

// ============================================================================
// IMPORTS: Dependencias externas y tipos
// ============================================================================
import { useState, useEffect } from 'react'; // Hooks de React
import { useRouter } from 'expo-router'; // Router para navegación automática
import { CreateProductInput } from '../types/product'; // Tipo del formulario
import { createProduct } from '../services/productService'; // Servicio de creación
import { getCategories } from '../services/categoryService'; // Servicio de categorías
import { getColors } from '../services/colorService'; // Servicio de colores
import { Category, Color } from '../types/product'; // Tipos de opciones
import { CreateProductSchema } from '../schemas/product.schema'; // Schema de validación Zod

// ============================================================================
// TYPES: Interfaz del retorno del hook
// ============================================================================
interface UseCreateProductReturn {
  // === DATOS DEL FORMULARIO ===
  formData: CreateProductInput;  // Objeto con todos los campos del formulario
  setFormData: React.Dispatch<React.SetStateAction<CreateProductInput>>;  // Setter directo
  
  // === OPCIONES DISPONIBLES (cargadas desde API) ===
  categories: Category[];  // Array de categorías seleccionables
  colors: Color[];         // Array de colores seleccionables
  isLoadingOptions: boolean;  // Indica si aún está cargando categorías/colores
  
  // === ESTADOS DE UI ===
  isSubmitting: boolean;                // Indica si hay envío en progreso
  error: string | null;                 // Mensaje de error general (ej: error de red)
  fieldErrors: Record<string, string>;  // Errores por campo individual (ej: { name: "Requerido" })
  
  // === ACCIONES ===
  handleSubmit: () => Promise<void>;     // Función para enviar el formulario
  handleCategoryToggle: (categoryId: string) => void;  // Toggle selección de categoría
  handleColorToggle: (colorId: string) => void;        // Toggle selección de color
  updateField: <K extends keyof CreateProductInput>(field: K, value: CreateProductInput[K]) => void;  // Actualizar un campo
}

// ============================================================================
// CONSTANTES: Valores iniciales del formulario
// ============================================================================
const initialFormData: CreateProductInput = {
  name: '',           // Nombre del producto (vacío inicialmente)
  description: '',    // Descripción detallada (vacío)
  material: '',       // Material del que está hecho (vacío)
  price: 0,           // Precio en euros (0 por defecto)
  dimensions: '',     // Dimensiones físicas (vacío)
  imageUrl: '',       // URL de la imagen principal (vacío)
  imageAlt: '',       // Texto alternativo para la imagen (vacío)
  categoryIds: [],    // Array de IDs de categorías seleccionadas (vacío inicialmente)
  colorIds: [],       // Array de IDs de colores seleccionados (vacío inicialmente)
};

// ============================================================================
// HOOK PRINCIPAL: useCreateProduct
// ============================================================================
export const useCreateProduct = (): UseCreateProductReturn => {
  // === PASO 1: Obtener router para navegación ===
  const router = useRouter(); // Para navegar después de crear producto
  
  // === PASO 2: Declarar estados del formulario ===
  
  // Estado: Datos del formulario (inicializado con valores vacíos)
  const [formData, setFormData] = useState<CreateProductInput>(initialFormData);
  
  // === PASO 3: Estados para opciones (categorías y colores) ===
  
  // Estado: Array de categorías disponibles cargadas desde API
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Estado: Array de colores disponibles cargados desde API
  const [colors, setColors] = useState<Color[]>([]);
  
  // Estado: Indica si aún está cargando categorías y colores
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  
  // === PASO 4: Estados de UI y errores ===
  
  // Estado: Indica si hay un envío de formulario en progreso
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado: Mensaje de error general (errores de red, sesión, etc)
  const [error, setError] = useState<string | null>(null);
  
  // Estado: Errores específicos por campo (ej: { name: "Mínimo 3 caracteres" })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ============================================================================
  // EFECTO: Carga inicial de categorías y colores
  // ============================================================================
  /**
   * Efecto que se ejecuta una sola vez al montar el componente.
   * Carga las categorías y colores disponibles desde la API.
   */
  useEffect(() => {
    loadOptions(); // Llamar a función de carga
  }, []); // Array vacío = solo ejecutar al montar

  // ============================================================================
  // FUNCIÓN: loadOptions - Cargar opciones desde API
  // ============================================================================
  const loadOptions = async () => {
    try {
      // === PASO 1: Activar indicador de carga ===
      setIsLoadingOptions(true);
      
      // === PASO 2: Cargar categorías y colores en paralelo ===
      const [categoriesData, colorsData] = await Promise.all([
        getCategories(),  // API call: GET /categories
        getColors(),      // API call: GET /colors
      ]);
      // Promise.all() ejecuta ambas llamadas simultáneamente (más rápido)
      
      // === PASO 3: Guardar datos en estado ===
      setCategories(categoriesData);  // Array de Category[]
      setColors(colorsData);          // Array de Color[]
    } catch (err) {
      // === MANEJO DE ERRORES ===
      console.error('[useCreateProduct] Error loading options:', err);
      setError('Error al cargar categorías y colores');
      // Nota: El formulario podría no funcionar correctamente sin estas opciones
    } finally {
      // === PASO 4: Desactivar indicador de carga ===
      setIsLoadingOptions(false);
      // El formulario ya puede mostrarse (aunque esté vacío si hubo error)
    }
  };

  // ============================================================================
  // FUNCIÓN: updateField - Actualizar un campo del formulario
  // ============================================================================
  /**
   * Actualiza el valor de un campo específico del formulario.
   * También limpia automáticamente el error de ese campo si existe.
   * 
   * @template K - Clave del campo (type-safe)
   * @param {K} field - Nombre del campo a actualizar
   * @param {CreateProductInput[K]} value - Nuevo valor para el campo
   */
  const updateField = <K extends keyof CreateProductInput>(
    field: K,
    value: CreateProductInput[K]
  ) => {
    // === PASO 1: Actualizar valor del campo en formData ===
    setFormData(prev => ({ ...prev, [field]: value }));
    // prev = estado anterior del formulario
    // { ...prev, [field]: value } = spread con override del campo específico
    
    // === PASO 2: Limpiar error del campo si existía ===
    // Al empezar a escribir, el error ya no es relevante
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };  // Copia del objeto de errores
        delete newErrors[field];         // Eliminar error de este campo
        return newErrors;                // Retornar nuevo objeto sin el error
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
          // Caso 1: Ya está seleccionada → removerla del array
          ? prev.categoryIds.filter(id => id !== categoryId)
          // Caso 2: No está seleccionada → agregarla al array
          : [...prev.categoryIds, categoryId],
      };
    });
    
    // === PASO 2: Limpiar error de categorías si existe ===
    if (fieldErrors.categoryIds) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.categoryIds;  // Quitar mensaje de "Selecciona al menos 1 categoría"
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
          // Caso 1: Ya está seleccionado → removerlo del array
          ? prev.colorIds.filter(id => id !== colorId)
          // Caso 2: No está seleccionado → agregarlo al array
          : [...prev.colorIds, colorId],
      };
    });
    
    // === PASO 2: Limpiar error de colores si existe ===
    if (fieldErrors.colorIds) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.colorIds;  // Quitar mensaje de "Selecciona al menos 1 color"
        return newErrors;
      });
    }
  };

  // ============================================================================
  // FUNCIÓN: handleSubmit - Enviar formulario a la API
  // ============================================================================
  /**
   * Valida y envía el formulario para crear un nuevo producto.
   * Maneja validación con Zod, errores de API y navegación automática.
   */
  const handleSubmit = async () => {
    try {
      // === PASO 1: Preparar para envío ===
      setIsSubmitting(true);    // Activar indicador de carga (deshabilita botón)
      setError(null);           // Limpiar error general previo
      setFieldErrors({});       // Limpiar todos los errores de campos

      // === PASO 2: Validar datos con Zod schema ===
      const validatedData = CreateProductSchema.parse(formData);
      // CreateProductSchema.parse() valida:
      // - Tipos correctos (string, number, array)
      // - Longitudes mínimas (name >= 3 chars, etc)
      // - Formatos válidos (URL válida, price > 0, etc)
      // - Campos requeridos (lanza error si falta alguno)
      // Si falla, lanza ZodError que será capturado en el catch

      // === PASO 3: Enviar a la API ===
      await createProduct(validatedData);
      // POST /products con datos validados
      // createProduct() lanza error si falla (red, autenticación, etc)

      // === PASO 4: Navegación exitosa ===
      router.back();
      // Vuelve a la pantalla anterior (normalmente el dashboard de productos)
      // El producto recién creado debería aparecer en la lista
    } catch (err: any) {
      // === MANEJO DE ERRORES ===
      console.error('[useCreateProduct] Error creating product:', err);
      
      // === CASO 1: Error de validación Zod ===
      if (err.name === 'ZodError') {
        // ZodError contiene array de errores específicos por campo
        const errors: Record<string, string> = {};
        
        // Iterar sobre cada error de Zod
        err.errors.forEach((error: any) => {
          const field = error.path[0];     // Nombre del campo con error (ej: 'name')
          errors[field] = error.message;   // Mensaje del error (ej: 'Mínimo 3 caracteres')
        });
        
        // Guardar errores por campo para mostrar en UI
        setFieldErrors(errors);
        // Ejemplos de errores:
        // { name: 'Mínimo 3 caracteres' }
        // { price: 'Debe ser mayor a 0' }
        // { categoryIds: 'Selecciona al menos 1 categoría' }
        
        // Setear mensaje general
        setError('Por favor corrige los errores en el formulario');
      } 
      // === CASO 2: Otros errores (API, red, sesión) ===
      else {
        // === SUBCASO 2.1: Sesión expirada ===
        if (err.message?.includes('sesión ha expirada')) {
          setError(err.message); // Mostrar mensaje de sesión expirada
          
          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            router.replace('/login');
            // replace() elimina la página actual del historial
            // (el usuario no puede volver atrás a una sesión expirada)
          }, 2000);
        } 
        // === SUBCASO 2.2: Otros errores de API ===
        else {
          setError(err.message || 'Error al crear el producto');
          // Mensaje genérico si no hay mensaje específico
        }
      }
    } finally {
      // === PASO 5: Siempre desactivar indicador de carga ===
      setIsSubmitting(false);
      // Ya sea éxito o error, desbloquear el botón de enviar
    }
  };

  // ============================================================================
  // RETORNO: API pública del hook
  // ============================================================================
  return {
    // === DATOS DEL FORMULARIO ===
    formData,         // CreateProductInput: todos los campos del formulario
    setFormData,      // Setter directo (para casos especiales)
    
    // === OPCIONES DISPONIBLES ===
    categories,       // Category[]: categorías cargadas desde API
    colors,           // Color[]: colores cargados desde API
    isLoadingOptions, // boolean: true mientras carga categorías/colores
    
    // === ESTADOS DE UI ===
    isSubmitting,     // boolean: true durante envío del formulario
    error,            // string | null: mensaje de error general
    fieldErrors,      // Record<string, string>: errores específicos por campo
    
    // === ACCIONES ===
    handleSubmit,          // () => Promise<void>: validar y enviar formulario
    handleCategoryToggle,  // (id: string) => void: toggle selección de categoría
    handleColorToggle,     // (id: string) => void: toggle selección de color
    updateField,           // <K>(field: K, value: any) => void: actualizar campo
  };
};
