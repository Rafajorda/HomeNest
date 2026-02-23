import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models/cart.dart';
import '../core/models/order.dart';
import '../core/services/cart_service.dart';
import '../core/services/order_service.dart';
import 'auth_provider.dart';

/// Estado del carrito
class CartState {
  final CartModel? cart;
  final bool isLoading;
  final String? errorMessage;

  CartState({this.cart, this.isLoading = false, this.errorMessage});

  CartState copyWith({CartModel? cart, bool? isLoading, String? errorMessage}) {
    return CartState(
      cart: cart ?? this.cart,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }

  /// Número de items en el carrito
  int get itemCount => cart?.itemCount ?? 0;

  /// Total del carrito
  double get total => cart?.total ?? 0.0;

  /// Verifica si el carrito está vacío
  bool get isEmpty => cart?.isEmpty ?? true;
}

/// Notifier para manejar el estado del carrito
class CartNotifier extends Notifier<CartState> {
  @override
  CartState build() {
    // Cargar el carrito al inicializar
    _loadCart();
    return CartState();
  }

  /// Obtiene el servicio de carrito
  CartService? get _cartService {
    final authState = ref.read(authProvider);
    if (authState.accessToken != null) {
      return CartService(authToken: authState.accessToken!);
    }
    return null;
  }

  /// Carga el carrito desde el servidor
  Future<void> _loadCart() async {
    final service = _cartService;
    if (service == null) return;

    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final cart = await service.getCart();
      state = CartState(cart: cart, isLoading: false);
    } catch (e) {
      state = CartState(
        cart: CartModel.empty(),
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  /// Recarga el carrito
  Future<void> loadCart() => _loadCart();

  /// Añade un producto al carrito
  Future<bool> addToCart(String productId) async {
    final service = _cartService;
    if (service == null) return false;

    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final cart = await service.addToCart(productId);
      state = CartState(cart: cart, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
      return false;
    }
  }

  /// Elimina un producto del carrito
  Future<bool> removeFromCart(String productId) async {
    final service = _cartService;
    if (service == null) return false;

    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final cart = await service.removeFromCart(productId);
      state = CartState(cart: cart, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
      return false;
    }
  }

  /// Vacía completamente el carrito
  Future<bool> clearCart() async {
    final service = _cartService;
    if (service == null) return false;

    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final cart = await service.clearCart();
      state = CartState(cart: cart, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
      return false;
    }
  }

  /// Realiza el checkout (crear pedido desde el carrito)
  Future<OrderModel?> checkout() async {
    final service = _cartService;
    if (service == null) return null;

    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final order = await service.checkout();
      // Después del checkout, el carrito se vacía automáticamente
      state = CartState(cart: CartModel.empty(), isLoading: false);
      return order;
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
      return null;
    }
  }

  /// Reinicia el estado
  void reset() {
    state = CartState(cart: CartModel.empty());
  }
}

/// Provider del notifier del carrito
final cartProvider = NotifierProvider<CartNotifier, CartState>(() {
  return CartNotifier();
});

/// Provider para el número de items en el carrito (para badge)
final cartItemCountProvider = Provider<int>((ref) {
  final cartState = ref.watch(cartProvider);
  return cartState.itemCount;
});

// ============================================
// PROVIDERS DE ÓRDENES/PEDIDOS
// ============================================

/// Provider del servicio de órdenes
final orderServiceProvider = Provider<OrderService?>((ref) {
  final authState = ref.watch(authProvider);
  if (authState.accessToken != null) {
    return OrderService(authToken: authState.accessToken!);
  }
  return null;
});

/// Provider para obtener todos los pedidos del usuario
final myOrdersProvider = FutureProvider<List<OrderModel>>((ref) async {
  final orderService = ref.watch(orderServiceProvider);
  if (orderService == null) {
    throw Exception('Usuario no autenticado');
  }
  return await orderService.getMyOrders();
});

/// Provider para obtener un pedido específico por ID
final orderByIdProvider = FutureProvider.family<OrderModel, String>((
  ref,
  orderId,
) async {
  final orderService = ref.watch(orderServiceProvider);
  if (orderService == null) {
    throw Exception('Usuario no autenticado');
  }
  return await orderService.getOrderById(orderId);
});
