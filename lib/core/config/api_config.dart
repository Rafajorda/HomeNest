/// Configuración centralizada de la API del backend
///
/// Este archivo contiene:
/// - URL base del servidor NestJS
/// - Todos los endpoints de la API REST
/// - Timeouts para peticiones HTTP
/// - Headers por defecto y de autenticación
///
/// IMPORTANTE: Actualizar baseUrl según el entorno:
/// - Android Emulator: 10.0.2.2:3000
/// - iOS Simulator: localhost:3000
/// - Dispositivo físico: IP de tu ordenador (ej: 192.168.1.100:3000)
class ApiConfig {
  /// URL base del servidor backend (NestJS)
  ///
  /// Configuración actual: Android Emulator
  /// Para iOS Simulator cambiar a: http://localhost:3000
  /// Para dispositivo físico cambiar a: http://TU_IP_LOCAL:3000
  ///
  /// Encontrar tu IP local:
  /// - Windows: ipconfig (buscar IPv4)
  /// - Mac/Linux: ifconfig (buscar inet)
  static const String baseUrl = 'http://10.0.2.2:3000';

  // Alternativa: Configuración automática según plataforma
  // static String get baseUrl {
  //   if (Platform.isAndroid) {
  //     return 'http://10.0.2.2:3000'; // Android emulator
  //   } else if (Platform.isIOS) {
  //     return 'http://localhost:3000'; // iOS simulator
  //   }
  //   return 'http://192.168.1.100:3000'; // Dispositivo físico - ajusta la IP
  // }

  // ============================================
  // ENDPOINTS DE AUTENTICACIÓN
  // ============================================

  /// POST /auth/login - Iniciar sesión
  /// Body: { email: string, password: string }
  /// Response: { access_token, refresh_token, user }
  static const String loginEndpoint = '/auth/login';

  /// POST /auth/register - Registrar nuevo usuario
  /// Body: { username: string, email: string, password: string }
  /// Response: { access_token, refresh_token, user }
  static const String registerEndpoint = '/auth/register';

  /// POST /auth/refresh - Refrescar access token
  /// Body: { refresh_token: string }
  /// Response: { access_token, refresh_token }
  static const String refreshEndpoint = '/auth/refresh';

  /// POST /auth/logout - Cerrar sesión actual
  /// Headers: Authorization: Bearer `<token>`
  static const String logoutEndpoint = '/auth/logout';

  /// POST /auth/logout-all - Cerrar todas las sesiones del usuario
  /// Headers: Authorization: Bearer `<token>`
  static const String logoutAllEndpoint = '/auth/logout-all';

  /// GET /auth/verify - Verificar si un token es válido
  /// Headers: Authorization: Bearer `<token>`
  static const String verifyTokenEndpoint = '/auth/verify';

  /// GET /auth/profile - Obtener perfil del usuario autenticado
  /// Headers: Authorization: Bearer `<token>`
  static const String profileEndpoint = '/auth/profile';

  /// PUT /auth/profile - Actualizar perfil del usuario autenticado
  /// Headers: Authorization: Bearer `<token>`
  /// Body: { name?: string, email?: string, avatar?: string }
  /// Response: UserData actualizado
  static const String updateProfileEndpoint = '/auth/profile';

  // ============================================
  // ENDPOINTS DE PRODUCTOS
  // ============================================

  /// GET /product - Obtener todos los productos (con query params opcionales)
  /// Query params: ?category=id&search=text&minPrice=100&maxPrice=500
  static const String productsEndpoint = '/product';

  /// GET /product/:id - Obtener un producto específico por ID
  /// Ejemplo: /product/550e8400-e29b-41d4-a716-446655440000
  static String productByIdEndpoint(String id) => '/product/$id';

  /// GET /product/category/:category - Obtener productos por categoría
  /// Ejemplo: /product/category/electronics
  static const String productsByCategoryEndpoint = '/product/category';

  // ============================================
  // ENDPOINTS DE CATEGORÍAS
  // ============================================

  /// GET /category - Obtener todas las categorías
  /// Response: [{ id, name, status }]
  static const String categoriesEndpoint = '/category';

  // ============================================
  // ENDPOINTS DE CARRITO (IMPLEMENTACIÓN FUTURA)
  // ============================================

  /// GET /cart - Obtener carrito del usuario
  /// POST /cart/add - Añadir producto al carrito
  /// POST /cart/remove - Eliminar producto del carrito
  /// PUT /cart/update - Actualizar cantidad de producto
  /// DELETE /cart/clear - Vaciar carrito
  static const String cartEndpoint = '/cart';
  static String addToCartEndpoint = '/cart/add';
  static String removeFromCartEndpoint = '/cart/remove';
  static String updateCartEndpoint = '/cart/update';
  static String clearCartEndpoint = '/cart/clear';

  // ============================================
  // CONFIGURACIÓN DE TIMEOUTS
  // ============================================

  /// Timeout para establecer conexión con el servidor
  /// Si no se conecta en 30 segundos, lanza TimeoutException
  static const Duration connectionTimeout = Duration(seconds: 30);

  /// Timeout para recibir respuesta del servidor
  /// Si el servidor no responde en 30 segundos, lanza TimeoutException
  static const Duration receiveTimeout = Duration(seconds: 30);

  // ============================================
  // HEADERS HTTP
  // ============================================

  /// Headers por defecto para todas las peticiones
  /// - Content-Type: Indica que enviamos JSON con codificación UTF-8
  /// - Accept: Indica que esperamos recibir JSON
  static Map<String, String> get defaultHeaders => {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json',
  };

  /// Headers con autenticación JWT
  ///
  /// Incluye defaultHeaders + Authorization Bearer token
  /// Usar en endpoints que requieren autenticación (favoritos, perfil, etc.)
  ///
  /// Ejemplo de uso:
  /// ```dart
  /// final response = await http.get(
  ///   Uri.parse('${ApiConfig.baseUrl}/auth/profile'),
  ///   headers: ApiConfig.authHeaders(accessToken),
  /// );
  /// ```
  static Map<String, String> authHeaders(String token) => {
    ...defaultHeaders,
    'Authorization': 'Bearer $token',
  };
}
