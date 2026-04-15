import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/order.dart';

/// Excepciones para el servicio de pedidos
class OrderException implements Exception {
  final String message;
  final int? statusCode;

  OrderException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Servicio de pedidos - maneja todas las peticiones relacionadas con órdenes/ventas
class OrderService {
  final http.Client _client;
  final String _authToken;

  OrderService({required String authToken, http.Client? client})
    : _authToken = authToken,
      _client = client ?? http.Client();

  /// Obtiene todos los pedidos del usuario autenticado
  Future<List<OrderModel>> getMyOrders() async {
    try {
      final url = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.myOrdersEndpoint}',
      );

      final response = await _client
          .get(url, headers: ApiConfig.authHeaders(_authToken))
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => OrderModel.fromJson(json)).toList();
      } else if (response.statusCode == 404) {
        // Si no hay pedidos, devolver lista vacía
        return [];
      } else {
        throw OrderException(
          'Error al obtener pedidos',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is OrderException) rethrow;
      throw OrderException('Error de conexión: ${e.toString()}');
    }
  }

  /// Obtiene un pedido específico por ID
  Future<OrderModel> getOrderById(String orderId) async {
    try {
      final url = Uri.parse(
        '${ApiConfig.baseUrl}${ApiConfig.orderByIdEndpoint(orderId)}',
      );

      final response = await _client
          .get(url, headers: ApiConfig.authHeaders(_authToken))
          .timeout(ApiConfig.connectionTimeout);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return OrderModel.fromJson(data);
      } else if (response.statusCode == 404) {
        throw OrderException('Pedido no encontrado', statusCode: 404);
      } else {
        throw OrderException(
          'Error al obtener el pedido',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is OrderException) rethrow;
      throw OrderException('Error de conexión: ${e.toString()}');
    }
  }

  /// Cierra el cliente HTTP
  void dispose() {
    _client.close();
  }
}
