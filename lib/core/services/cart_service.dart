import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/cart.dart';
import '../models/order.dart';

/// Excepciones para el servicio de carrito
class CartException implements Exception {
  final String message;
  final int? statusCode;

  CartException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Servicio de carrito - maneja todas las peticiones relacionadas con el carrito
class CartService {
  final http.Client _client;
  final String _authToken;

  CartService({required String authToken, http.Client? client})
    : _authToken = authToken,
      _client = client ?? http.Client();

  /// Obtiene el carrito del usuario
  Future<CartModel> getCart() async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.cartEndpoint}');

      final response = await _client
          .get(url, headers: ApiConfig.authHeaders(_authToken))
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return CartModel.fromJson(data);
      } else if (response.statusCode == 404) {
        // Si no existe carrito, devolver carrito vacío
        return CartModel.empty();
      } else {
        throw CartException(
          'Error al obtener carrito',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is CartException) rethrow;
      throw CartException('Error de conexión: ${e.toString()}');
    }
  }

  /// Añade un producto al carrito
  /// Devuelve el carrito actualizado
  Future<CartModel> addToCart(String productId) async {
    try {
      final url = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.addToCartEndpoint(productId)}',
      );

      final response = await _client
          .post(url, headers: ApiConfig.authHeaders(_authToken))
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Después de añadir, obtener el carrito actualizado
        return await getCart();
      } else if (response.statusCode == 404) {
        throw CartException('Producto no encontrado', statusCode: 404);
      } else {
        throw CartException(
          'Error al añadir al carrito',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is CartException) rethrow;
      throw CartException('Error de conexión: ${e.toString()}');
    }
  }

  /// Elimina un producto del carrito
  /// Devuelve el carrito actualizado
  Future<CartModel> removeFromCart(String productId) async {
    try {
      final url = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.removeFromCartEndpoint(productId)}',
      );

      final response = await _client
          .delete(url, headers: ApiConfig.authHeaders(_authToken))
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200 || response.statusCode == 204) {
        // Después de eliminar, obtener el carrito actualizado
        return await getCart();
      } else if (response.statusCode == 404) {
        throw CartException(
          'Item no encontrado en el carrito',
          statusCode: 404,
        );
      } else {
        throw CartException(
          'Error al eliminar del carrito',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is CartException) rethrow;
      throw CartException('Error de conexión: ${e.toString()}');
    }
  }

  /// Vacía el carrito completamente
  /// Devuelve el carrito vacío
  Future<CartModel> clearCart() async {
    try {
      final url = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.clearCartEndpoint}',
      );

      final response = await _client
          .delete(url, headers: ApiConfig.authHeaders(_authToken))
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200 || response.statusCode == 204) {
        return CartModel.empty();
      } else {
        throw CartException(
          'Error al vaciar carrito',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is CartException) rethrow;
      throw CartException('Error de conexión: ${e.toString()}');
    }
  }

  /// Realiza el checkout (crear pedido desde el carrito)
  /// Devuelve el pedido creado
  Future<OrderModel> checkout() async {
    try {
      final url = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.checkoutEndpoint}',
      );

      final response = await _client
          .post(url, headers: ApiConfig.authHeaders(_authToken))
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return OrderModel.fromJson(data);
      } else if (response.statusCode == 400) {
        final error = jsonDecode(response.body);
        throw CartException(
          error['message'] ?? 'El carrito está vacío',
          statusCode: 400,
        );
      } else {
        throw CartException(
          'Error al crear el pedido',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is CartException) rethrow;
      throw CartException('Error de conexión: ${e.toString()}');
    }
  }

  /// Cierra el cliente HTTP
  void dispose() {
    _client.close();
  }
}
