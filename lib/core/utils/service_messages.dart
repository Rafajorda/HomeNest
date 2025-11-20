/// Mensajes de error y estado para servicios
///
/// Esta clase centraliza todos los mensajes que los servicios pueden retornar.
/// Facilita la localización futura y mantiene consistencia en los mensajes.
class ServiceMessages {
  // ==================== AUTH SERVICE ====================

  // Errores de credenciales
  static const invalidCredentials = 'Invalid credentials';
  static const emailOrPasswordIncorrect = 'Email or password incorrect';
  static const loginError = 'Login error';

  // Errores de registro
  static const emailOrUsernameInUse = 'Email or username is already in use';
  static const validationError = 'Validation error';
  static const registrationError = 'Registration error';

  // Errores de sesión
  static const sessionExpired = 'Session expired. Please log in again.';
  static const errorRefreshingSession = 'Error refreshing session';
  static const connectionErrorRefreshing =
      'Connection error while refreshing session';

  // Errores de conexión
  static const connectionToServerError =
      'Connection error to server. Check that backend is running.';

  // ==================== PRODUCT SERVICE ====================

  static const unexpectedResponseFormat = 'Unexpected response format';
  static const errorGettingProducts = 'Error getting products';
  static const productNotFound = 'Product not found';
  static const errorGettingProduct = 'Error getting product';
  static const errorGettingProductsByCategory =
      'Error getting products by category';
  static const errorSearchingProducts = 'Error searching products';
  static const connectionError = 'Connection error';

  // ==================== CART SERVICE ====================

  static const errorGettingCart = 'Error getting cart';
  static const errorAddingToCart = 'Error adding to cart';
  static const itemNotFoundInCart = 'Item not found in cart';
  static const errorUpdatingCart = 'Error updating cart';
  static const errorRemovingFromCart = 'Error removing from cart';
  static const errorClearingCart = 'Error clearing cart';

  // ==================== FAVORITES SERVICE ====================

  static const notAuthenticated = 'Not authenticated';
  static const errorGettingFavorites = 'Error getting favorites';
  static const unauthorized = 'Unauthorized';
  static const productAlreadyInFavorites = 'Product already in favorites';
  static const errorAddingToFavorites = 'Error adding to favorites';
  static const favoriteNotFound = 'Favorite not found';
  static const errorRemovingFromFavorites = 'Error removing from favorites';
  static const productNotFoundInFavorites = 'Product not found in favorites';

  // ==================== CATEGORY SERVICE ====================

  static const errorGettingCategories = 'Error getting categories';

  // ==================== COLOR SERVICE ====================

  static const errorGettingColors = 'Error getting colors';

  // ==================== GENERAL ====================

  static const unexpectedError = 'Unexpected error';
  static String connectionErrorWithDetails(String details) =>
      'Connection error: $details';
  static String errorWithMessage(String message) => 'Error: $message';
}
