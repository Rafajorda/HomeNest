import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/foundation.dart';

/// Configuración centralizada de la API del backend
///
/// Este archivo contiene:
/// - URL base del servidor NestJS (desde .env)
/// - Todos los endpoints de la API REST
/// - Timeouts para peticiones HTTP
/// - Headers por defecto y de autenticación
///
/// IMPORTANTE: Configurar en archivo .env:
/// - API_PORT: Puerto del servidor (normalmente 3000)
class ApiConfig {
  /// URL base del servidor backend (NestJS)
  ///
  /// Lee desde archivo .env:
  /// - API_HOST: IP del servidor
  /// - API_PORT: Puerto
  ///
  /// Ejemplos según entorno:
  /// - Android Emulator: API_HOST=10.0.2.2
  /// - iOS Simulator: API_HOST=localhost
  /// - Dispositivo físico: API_HOST=192.168.1.100 (tu IP local)
  static String get baseUrl {
    final host = dotenv.env['API_HOST'] ?? 'localhost';
    final port = dotenv.env['API_PORT'] ?? '3000';
    if (kDebugMode) {
      print('🌐 [ApiConfig] HOST desde .env: $host');
      print('🌐 [ApiConfig] PORT desde .env: $port');
      print('🌐 [ApiConfig] Base URL: http://$host:$port');
    }
    return 'http://$host:$port';
  }

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
  // ENDPOINTS DE CARRITO
  // ============================================

  /// GET /auth/cart - Obtener carrito del usuario
  static const String cartEndpoint = '/auth/cart';

  /// POST /auth/cart/add/:productId - Añadir producto al carrito
  static String addToCartEndpoint(String productId) =>
      '/auth/cart/add/$productId';

  /// DELETE /auth/cart/remove/:productId - Eliminar producto del carrito
  static String removeFromCartEndpoint(String productId) =>
      '/auth/cart/remove/$productId';

  /// DELETE /auth/cart/clear - Vaciar carrito
  static const String clearCartEndpoint = '/auth/cart/clear';

  // ============================================
  // ENDPOINTS DE PEDIDOS/VENTAS
  // ============================================

  /// POST /auth/cart/checkout - Crear pedido desde el carrito
  /// Headers: Authorization: Bearer `<token>`
  /// Response: Order completa con orderLines
  static const String checkoutEndpoint = '/auth/cart/checkout';

  /// GET /order/user - Obtener todos los pedidos del usuario autenticado
  /// Headers: Authorization: Bearer `<token>`
  /// Response: [Order]
  static const String myOrdersEndpoint = '/order/user';

  /// GET /order/:id - Obtener un pedido específico por ID
  /// Headers: Authorization: Bearer `<token>`
  static String orderByIdEndpoint(String id) => '/order/$id';

  // ============================================
  // ENDPOINTS DE FAVORITOS
  // ============================================

  /// GET /favorites - Obtener todos los favoritos del usuario autenticado
  /// Headers: Authorization: Bearer `<token>`
  /// Response: [Favorite]
  static const String favoritesEndpoint = '/favorites';

  /// POST /favorites - Crear un nuevo favorito
  /// Headers: Authorization: Bearer `<token>`
  /// Body: { productId: string }
  /// Response: Favorite creado
  static const String createFavoriteEndpoint = '/favorites';

  /// DELETE /favorites/:id - Eliminar un favorito
  /// Headers: Authorization: Bearer `<token>`
  static String deleteFavoriteEndpoint(String id) => '/favorites/$id';

  /// GET /favorites/check/:productId - Verificar si un producto está en favoritos
  /// Headers: Authorization: Bearer `<token>`
  /// Response: { isFavorite: boolean }
  static String checkFavoriteEndpoint(String productId) =>
      '/favorites/check/$productId';
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
