import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:flutter/foundation.dart';

/// Interceptor HTTP que maneja automáticamente el refresh de tokens.
///
/// Funcionalidades:
/// - Intercepta todas las peticiones HTTP
/// - Si recibe 401 (Unauthorized), intenta refrescar el token
/// - Reintenta automáticamente la petición original con el nuevo token
/// - Evita múltiples refresh simultáneos con un lock
///
/// Uso:
/// ```dart
/// final interceptor = AuthInterceptor(
///   refreshTokenCallback: () async {
///     // Lógica para refrescar token
///     return await authProvider.refreshTokens();
///   },
///   getAccessTokenCallback: () {
///     return authProvider.state.accessToken;
///   },
/// );
///
/// // Usar en lugar de http.Client directamente
/// final response = await interceptor.send(request);
/// ```
class AuthInterceptor {
  final Future<bool> Function() refreshTokenCallback;
  final String? Function() getAccessTokenCallback;
  final http.Client _client;

  /// Lock para evitar múltiples refresh simultáneos
  bool _isRefreshing = false;

  /// Cola de peticiones pendientes durante el refresh
  final List<_PendingRequest> _pendingRequests = [];

  AuthInterceptor({
    required this.refreshTokenCallback,
    required this.getAccessTokenCallback,
    http.Client? client,
  }) : _client = client ?? http.Client();

  /// Envía una petición HTTP con manejo automático de refresh.
  ///
  /// Si la petición falla con 401:
  /// 1. Intenta refrescar el token
  /// 2. Reintenta la petición con el nuevo token
  /// 3. Si el refresh falla, devuelve el error 401 original
  Future<http.Response> send(http.BaseRequest request) async {
    try {
      // Enviar petición original
      final streamedResponse = await _client.send(request);
      final response = await http.Response.fromStream(streamedResponse);

      // Si es 401, intentar refresh y reintentar
      if (response.statusCode == 401) {
        debugPrint('[AuthInterceptor] 🔄 Detectado 401, intentando refresh...');

        // Si ya está refrescando, esperar
        if (_isRefreshing) {
          return await _waitForRefreshAndRetry(request);
        }

        // Marcar como refrescando
        _isRefreshing = true;

        try {
          // Intentar refrescar token
          final refreshSuccess = await refreshTokenCallback();

          if (refreshSuccess) {
            debugPrint(
              '[AuthInterceptor] ✅ Refresh exitoso, reintentando petición...',
            );

            // Procesar peticiones pendientes
            _processPendingRequests(true);

            // Reintentar petición original con nuevo token
            return await _retryRequest(request);
          } else {
            debugPrint('[AuthInterceptor] ❌ Refresh falló, devolviendo 401');
            _processPendingRequests(false);
            return response; // Devolver 401 original
          }
        } finally {
          _isRefreshing = false;
        }
      }

      return response;
    } catch (e) {
      debugPrint('[AuthInterceptor] ❌ Error en interceptor: $e');
      rethrow;
    }
  }

  /// Reintenta una petición con el nuevo token.
  Future<http.Response> _retryRequest(http.BaseRequest originalRequest) async {
    // Clonar la petición original
    final newRequest = _cloneRequest(originalRequest);

    // Actualizar Authorization header con nuevo token
    final newToken = getAccessTokenCallback();
    if (newToken != null) {
      newRequest.headers['Authorization'] = 'Bearer $newToken';
    }

    final streamedResponse = await _client.send(newRequest);
    return await http.Response.fromStream(streamedResponse);
  }

  /// Espera a que termine el refresh actual y reintenta.
  Future<http.Response> _waitForRefreshAndRetry(
    http.BaseRequest request,
  ) async {
    final completer = _PendingRequest();
    _pendingRequests.add(completer);

    // Esperar a que termine el refresh
    final success = await completer.future;

    if (success) {
      return await _retryRequest(request);
    } else {
      // Si el refresh falló, devolver 401
      return http.Response('Unauthorized', 401);
    }
  }

  /// Procesa todas las peticiones pendientes después del refresh.
  void _processPendingRequests(bool success) {
    for (final pending in _pendingRequests) {
      pending.complete(success);
    }
    _pendingRequests.clear();
  }

  /// Clona una petición HTTP.
  http.BaseRequest _cloneRequest(http.BaseRequest request) {
    if (request is http.Request) {
      final newRequest = http.Request(request.method, request.url);
      newRequest.headers.addAll(request.headers);
      newRequest.bodyBytes = request.bodyBytes;
      return newRequest;
    } else if (request is http.MultipartRequest) {
      final newRequest = http.MultipartRequest(request.method, request.url);
      newRequest.headers.addAll(request.headers);
      newRequest.fields.addAll(request.fields);
      newRequest.files.addAll(request.files);
      return newRequest;
    } else {
      throw UnsupportedError(
        'Request type not supported: ${request.runtimeType}',
      );
    }
  }

  /// Método helper para GET
  Future<http.Response> get(Uri url, {Map<String, String>? headers}) async {
    final request = http.Request('GET', url);
    if (headers != null) request.headers.addAll(headers);
    return await send(request);
  }

  /// Método helper para POST
  Future<http.Response> post(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
  }) async {
    final request = http.Request('POST', url);
    if (headers != null) request.headers.addAll(headers);
    if (body != null) {
      if (body is String) {
        request.body = body;
      } else {
        request.body = jsonEncode(body);
      }
    }
    return await send(request);
  }

  /// Método helper para PUT
  Future<http.Response> put(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
  }) async {
    final request = http.Request('PUT', url);
    if (headers != null) request.headers.addAll(headers);
    if (body != null) {
      if (body is String) {
        request.body = body;
      } else {
        request.body = jsonEncode(body);
      }
    }
    return await send(request);
  }

  /// Método helper para DELETE
  Future<http.Response> delete(Uri url, {Map<String, String>? headers}) async {
    final request = http.Request('DELETE', url);
    if (headers != null) request.headers.addAll(headers);
    return await send(request);
  }

  void dispose() {
    _client.close();
  }
}

/// Clase helper para manejar peticiones pendientes.
class _PendingRequest {
  final Completer<bool> _completer = Completer<bool>();

  Future<bool> get future => _completer.future;

  void complete(bool success) {
    if (!_completer.isCompleted) {
      _completer.complete(success);
    }
  }
}
