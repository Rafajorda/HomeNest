import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:proyecto_1/core/services/auth_service.dart';
import 'package:proyecto_1/core/services/auth_interceptor.dart';

/// Estado de autenticación de la aplicación
///
/// Gestiona toda la información de la sesión del usuario:
/// - Estado de carga y errores
/// - Información del usuario (username, firstName, lastName, email)
/// - Tokens JWT (access token y refresh token)
/// - Timestamps de expiración de tokens
///
/// 🔐 Sistema de tokens:
/// - **Access Token**: Token de corta duración (~15 min) para autenticar requests
/// - **Refresh Token**: Token de larga duración (7 días) para renovar access tokens
/// - **Auto-refresh**: Cuando el access token expira, se renueva automáticamente
///
/// Ejemplo de uso:
/// ```dart
/// final authState = ref.watch(authProvider);
/// if (authState.isAuthenticated) {
///   Text('Hola ${authState.displayName}');
/// }
/// ```
class AuthState {
  /// Indica si hay una operación asíncrona en curso (login, register, refresh)
  final bool isLoading;

  /// Mensaje de error si la última operación falló
  final String? errorMessage;

  /// Indica si el usuario tiene sesión activa
  final bool isAuthenticated;

  /// Nombre de usuario único (del backend)
  final String? username;

  /// Primer nombre del usuario (opcional)
  final String? firstName;

  /// Apellido del usuario (opcional)
  final String? lastName;

  /// Email del usuario autenticado
  final String? userEmail;

  /// JWT access token (corta duración, ~15 min)
  final String? accessToken;

  /// JWT refresh token (larga duración, ~7 días)
  final String? refreshToken;

  /// Timestamp de expiración del access token (en milisegundos desde epoch)
  final int? accessTokenExpiresAt;

  /// Timestamp de expiración del refresh token (en milisegundos desde epoch)
  final int? refreshTokenExpiresAt;

  /// URL del avatar del usuario (opcional)
  final String? userAvatar;

  const AuthState({
    this.isLoading = false,
    this.errorMessage,
    this.isAuthenticated = false,
    this.username,
    this.firstName,
    this.lastName,
    this.userEmail,
    this.accessToken,
    this.refreshToken,
    this.accessTokenExpiresAt,
    this.refreshTokenExpiresAt,
    this.userAvatar,
  });

  /// Nombre para mostrar en UI (generado automáticamente)
  ///
  /// Lógica de construcción:
  /// 1. "firstName lastName" (si ambos existen)
  /// 2. Solo firstName (si existe)
  /// 3. Solo lastName (si existe)
  /// 4. username (si existe)
  /// 5. "User" (fallback)
  String get displayName {
    if (firstName != null && lastName != null) {
      return '$firstName $lastName'.trim();
    } else if (firstName != null) {
      return firstName!;
    } else if (lastName != null) {
      return lastName!;
    } else if (username != null) {
      return username!;
    }
    return 'User';
  }

  /// Verifica si el access token está expirado o próximo a expirar
  ///
  /// Considera expirado cuando quedan menos de 1 minuto (60,000 ms).
  /// Este margen de seguridad permite renovar el token antes de que expire
  /// completamente, evitando errores 401 en requests en curso.
  ///
  /// Returns: `true` si expira en menos de 1 minuto, `false` si es válido
  bool get isAccessTokenExpired {
    if (accessTokenExpiresAt == null) return false;
    final now = DateTime.now().millisecondsSinceEpoch;
    final expiresIn = accessTokenExpiresAt! - now;
    return expiresIn < 60000; // Menos de 1 minuto
  }

  /// Verifica si el refresh token está completamente expirado
  ///
  /// Si el refresh token expira (típicamente después de 7 días sin uso),
  /// el usuario DEBE hacer login nuevamente. No hay forma de renovar
  /// un refresh token expirado.
  ///
  /// Returns: `true` si ya expiró, `false` si aún es válido
  bool get isRefreshTokenExpired {
    if (refreshTokenExpiresAt == null) return false;
    final now = DateTime.now().millisecondsSinceEpoch;
    return now >= refreshTokenExpiresAt!;
  }

  /// Crea una copia del estado con campos modificados
  ///
  /// Patrón inmutable de Flutter: en lugar de modificar el estado actual,
  /// se crea una nueva instancia con los campos actualizados.
  ///
  /// Si un campo es `null`, mantiene el valor actual.
  /// Para limpiar un campo, pasa explícitamente `null`.
  AuthState copyWith({
    bool? isLoading,
    String? errorMessage,
    bool? isAuthenticated,
    String? username,
    String? firstName,
    String? lastName,
    String? userEmail,
    String? accessToken,
    String? refreshToken,
    int? accessTokenExpiresAt,
    int? refreshTokenExpiresAt,
    String? userAvatar,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      username: username ?? this.username,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      userEmail: userEmail ?? this.userEmail,
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      accessTokenExpiresAt: accessTokenExpiresAt ?? this.accessTokenExpiresAt,
      refreshTokenExpiresAt:
          refreshTokenExpiresAt ?? this.refreshTokenExpiresAt,
      userAvatar: userAvatar ?? this.userAvatar,
    );
  }
}

/// Notifier de autenticación - Gestiona toda la lógica de autenticación
///
/// Responsabilidades:
/// - 🔐 **Login/Register**: Autenticación con el backend (NestJS)
/// - 💾 **Persistencia**: Guarda sesión en SharedPreferences para que persista
/// - 🔄 **Auto-refresh**: Renueva access tokens automáticamente cuando expiran
/// - 🚪 **Logout**: Limpia sesión local y notifica al backend
/// - 📱 **Restauración**: Al abrir la app, restaura sesión guardada
///
/// 🔐 Flujo de sesión permanente:
/// 1. Usuario hace login → Tokens se guardan en SharedPreferences
/// 2. App se cierra y se vuelve a abrir → `_loadAuthState()` restaura sesión
/// 3. Access token expira → Auto-refresh con refresh token
/// 4. Refresh token expira (7 días) → Usuario debe hacer login manual
///
/// Arquitectura:
/// - Usa `Notifier<AuthState>` de Riverpod para gestionar estado
/// - Se comunica con `AuthService` para requests HTTP
/// - Integrado con `AuthInterceptor` para auto-refresh en requests
///
/// Ejemplo de uso:
/// ```dart
/// // Login
/// await ref.read(authProvider.notifier).login(email, password);
///
/// // Logout
/// await ref.read(authProvider.notifier).logout();
///
/// // Check auth state
/// final isAuth = ref.watch(authProvider).isAuthenticated;
/// ```
class AuthNotifier extends Notifier<AuthState> {
  /// Servicio HTTP para comunicación con el backend de autenticación
  late final AuthService _authService;

  /// Inicializa el notifier y carga el estado de autenticación guardado
  ///
  /// Este método se ejecuta automáticamente cuando se accede al provider
  /// por primera vez. Crea el AuthService y llama a `_loadAuthState()`
  /// para restaurar sesión si existe.
  @override
  AuthState build() {
    _authService = AuthService();

    // Cargar estado de autenticación al inicializar
    _loadAuthState();

    return const AuthState();
  }

  /// Carga el estado de autenticación guardado en SharedPreferences
  ///
  /// 🔐 Lógica de restauración de sesión:
  /// 1. Lee tokens y datos de usuario guardados
  /// 2. Verifica si el refresh token expiró (> 7 días) → Logout
  /// 3. Si access token es válido → Restaura sesión directamente
  /// 4. Si access token expiró → Intenta auto-refresh
  /// 5. Si refresh falla → Mantiene sesión local (usuario ve UI, debe logout manual)
  ///
  /// Este método se llama automáticamente al iniciar la app.
  ///
  /// Casos especiales:
  /// - **Refresh token expirado**: Hace logout automático
  /// - **Access token expirado pero refresh válido**: Auto-refresh exitoso
  /// - **Refresh falla (red/servidor)**: Mantiene sesión local para que usuario vea UI
  Future<void> _loadAuthState() async {
    final prefs = await SharedPreferences.getInstance();
    final isAuthenticated = prefs.getBool('isAuthenticated') ?? false;
    final username = prefs.getString('username');
    final firstName = prefs.getString('firstName');
    final lastName = prefs.getString('lastName');
    final userEmail = prefs.getString('userEmail');
    final userAvatar = prefs.getString('userAvatar');
    final accessToken = prefs.getString('accessToken');
    final refreshToken = prefs.getString('refreshToken');
    final accessTokenExpiresAt = prefs.getInt('accessTokenExpiresAt');
    final refreshTokenExpiresAt = prefs.getInt('refreshTokenExpiresAt');

    // 🔐 SESIÓN PERMANENTE: Si hay tokens guardados, siempre intentar restaurar
    if (isAuthenticated && refreshToken != null) {
      debugPrint(
        '[AuthProvider] 🔄 Detectados tokens guardados, restaurando sesión...',
      );

      // ⚠️ VERIFICAR SI EL REFRESH TOKEN EXPIRÓ (> 7 días)
      if (refreshTokenExpiresAt != null) {
        final now = DateTime.now().millisecondsSinceEpoch;
        if (now >= refreshTokenExpiresAt) {
          debugPrint(
            '[AuthProvider] ❌ Refresh token expirado, forzando logout',
          );
          await _clearAuthState();
          state = const AuthState();
          return;
        }
      }

      // Verificar si el access token está próximo a expirar (< 1 min)
      bool needsRefresh = false;
      if (accessTokenExpiresAt != null) {
        final now = DateTime.now().millisecondsSinceEpoch;
        final expiresIn = accessTokenExpiresAt - now;
        needsRefresh = expiresIn < 60000; // Menos de 1 minuto
      }

      if (!needsRefresh && accessToken != null) {
        // ✅ Access token válido - restaurar sesión directamente
        debugPrint('[AuthProvider] ✅ Access token válido, sesión restaurada');
        state = state.copyWith(
          isAuthenticated: true,
          username: username,
          firstName: firstName,
          lastName: lastName,
          userEmail: userEmail,
          userAvatar: userAvatar,
          accessToken: accessToken,
          refreshToken: refreshToken,
          accessTokenExpiresAt: accessTokenExpiresAt,
          refreshTokenExpiresAt: refreshTokenExpiresAt,
        );
      } else {
        // 🔄 Access token expirado o inválido - intentar refresh automático
        debugPrint(
          '[AuthProvider] ⚠️ Access token expirado, intentando refresh automático...',
        );

        try {
          final response = await _authService.refreshTokens(refreshToken);

          // Guardar nuevos tokens
          await _saveAuthState(
            isAuthenticated: true,
            username: username,
            firstName: firstName,
            lastName: lastName,
            userEmail: userEmail,
            userAvatar: userAvatar,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            accessTokenExpiresAt: response.accessTokenExpiresAt,
            refreshTokenExpiresAt: response.refreshTokenExpiresAt,
          );

          // Actualizar estado
          state = state.copyWith(
            isAuthenticated: true,
            username: username,
            firstName: firstName,
            lastName: lastName,
            userEmail: userEmail,
            userAvatar: userAvatar,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            accessTokenExpiresAt: response.accessTokenExpiresAt,
            refreshTokenExpiresAt: response.refreshTokenExpiresAt,
          );

          debugPrint('[AuthProvider] ✅ Sesión restaurada con refresh token');
        } catch (e) {
          // ⚠️ Refresh token inválido - Mantener sesión local pero mostrar warning
          // NO hacer logout automático - el usuario debe desloguearse manualmente
          debugPrint('[AuthProvider] ⚠️ Refresh token inválido: $e');
          debugPrint(
            '[AuthProvider] ℹ️ Manteniendo sesión local - usuario debe hacer logout manual',
          );

          // Restaurar sesión con tokens antiguos (aunque inválidos)
          // Esto permite que el usuario vea la UI y decida hacer logout
          state = state.copyWith(
            isAuthenticated: true,
            username: username,
            firstName: firstName,
            lastName: lastName,
            userEmail: userEmail,
            userAvatar: userAvatar,
            accessToken: accessToken,
            refreshToken: refreshToken,
          );

          // Opcional: Mostrar mensaje al usuario
          // showSnackbar('Sesión expirada. Por favor, cierra sesión e inicia de nuevo.');
        }
      }
    } else if (isAuthenticated) {
      // Caso raro: isAuthenticated pero no hay refresh token
      debugPrint(
        '[AuthProvider] ⚠️ Estado inconsistente: autenticado pero sin refresh token',
      );
      // Limpiar solo si no hay forma de recuperar la sesión
      await _clearAuthState();
    }
  }

  /// Guarda el estado de autenticación en SharedPreferences
  ///
  /// Persiste todos los datos de sesión para que sobrevivan al cierre de la app:
  /// - isAuthenticated: Flag de sesión activa
  /// - userName, userEmail: Datos del usuario
  /// - accessToken, refreshToken: Tokens JWT
  /// - Timestamps de expiración de ambos tokens
  ///
  /// Se llama después de:
  /// - Login exitoso
  /// - Register exitoso
  /// - Refresh de tokens exitoso
  Future<void> _saveAuthState({
    required bool isAuthenticated,
    String? username,
    String? firstName,
    String? lastName,
    String? userEmail,
    String? userAvatar,
    String? accessToken,
    String? refreshToken,
    int? accessTokenExpiresAt,
    int? refreshTokenExpiresAt,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isAuthenticated', isAuthenticated);
    if (username != null) await prefs.setString('username', username);
    if (firstName != null) await prefs.setString('firstName', firstName);
    if (lastName != null) await prefs.setString('lastName', lastName);
    if (userEmail != null) await prefs.setString('userEmail', userEmail);
    if (userAvatar != null) await prefs.setString('userAvatar', userAvatar);
    if (accessToken != null) await prefs.setString('accessToken', accessToken);
    if (refreshToken != null) {
      await prefs.setString('refreshToken', refreshToken);
    }
    if (accessTokenExpiresAt != null) {
      await prefs.setInt('accessTokenExpiresAt', accessTokenExpiresAt);
    }
    if (refreshTokenExpiresAt != null) {
      await prefs.setInt('refreshTokenExpiresAt', refreshTokenExpiresAt);
    }
  }

  /// Elimina todos los datos de autenticación de SharedPreferences
  ///
  /// Limpia completamente la sesión guardada. Se llama en:
  /// - Logout manual del usuario
  /// - Refresh token expirado (> 7 días)
  /// - Estado de autenticación inconsistente detectado
  ///
  /// Después de esto, el usuario tendrá que hacer login nuevamente.
  Future<void> _clearAuthState() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('isAuthenticated');
    await prefs.remove('username');
    await prefs.remove('firstName');
    await prefs.remove('lastName');
    await prefs.remove('userEmail');
    await prefs.remove('userAvatar');
    await prefs.remove('accessToken');
    await prefs.remove('refreshToken');
    await prefs.remove('accessTokenExpiresAt');
    await prefs.remove('refreshTokenExpiresAt');
  }

  /// Inicia sesión con email y contraseña en el backend
  ///
  /// Flujo:
  /// 1. Cambia estado a `isLoading: true`
  /// 2. Llama a `AuthService.login()` que hace POST a `/auth/login`
  /// 3. Si exitoso: Guarda tokens y datos de usuario en SharedPreferences
  /// 4. Actualiza estado con datos de usuario y `isAuthenticated: true`
  /// 5. Si falla: Captura excepción y actualiza `errorMessage`
  ///
  /// Parámetros:
  /// - [email]: Email del usuario (ej: "user@example.com")
  /// - [password]: Contraseña del usuario
  ///
  /// Errores posibles:
  /// - `AuthException`: Credenciales inválidas, usuario no existe, etc.
  /// - Errores de red: Timeout, sin conexión
  ///
  /// Ejemplo de uso:
  /// ```dart
  /// await ref.read(authProvider.notifier).login(
  ///   'user@example.com',
  ///   'password123',
  /// );
  /// if (ref.read(authProvider).errorMessage != null) {
  ///   // Mostrar error
  /// }
  /// ```
  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final response = await _authService.login(
        email: email,
        password: password,
      );

      await _saveAuthState(
        isAuthenticated: true,
        username: response.user.username,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        userEmail: response.user.email,
        userAvatar: response.user.avatar,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        accessTokenExpiresAt: response.accessTokenExpiresAt,
        refreshTokenExpiresAt: response.refreshTokenExpiresAt,
      );

      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        username: response.user.username,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        userEmail: response.user.email,
        userAvatar: response.user.avatar,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        accessTokenExpiresAt: response.accessTokenExpiresAt,
        refreshTokenExpiresAt: response.refreshTokenExpiresAt,
      );
    } on AuthException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Error inesperado: ${e.toString()}',
      );
    }
  }

  /// Registra un nuevo usuario en el backend
  ///
  /// Flujo:
  /// 1. Cambia estado a `isLoading: true`
  /// 2. Llama a `AuthService.register()` que hace POST a `/auth/register`
  /// 3. Si exitoso: Crea usuario Y automáticamente inicia sesión (devuelve tokens)
  /// 4. Guarda tokens y datos en SharedPreferences
  /// 5. Actualiza estado con `isAuthenticated: true`
  ///
  /// Parámetros:
  /// - [username]: Nombre de usuario (ej: "John Doe")
  /// - [email]: Email único del usuario
  /// - [password]: Contraseña (debe cumplir requisitos de seguridad del backend)
  ///
  /// Errores posibles:
  /// - `AuthException`: Email ya existe, contraseña débil, validación fallida
  /// - Errores de red
  ///
  /// Ejemplo de uso:
  /// ```dart
  /// await ref.read(authProvider.notifier).register(
  ///   'John Doe',
  ///   'john@example.com',
  ///   'SecurePass123!',
  /// );
  /// ```
  Future<void> register(String username, String email, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final response = await _authService.register(
        username: username,
        email: email,
        password: password,
      );

      await _saveAuthState(
        isAuthenticated: true,
        username: response.user.username,
        userEmail: response.user.email,
        userAvatar: response.user.avatar,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        accessTokenExpiresAt: response.accessTokenExpiresAt,
        refreshTokenExpiresAt: response.refreshTokenExpiresAt,
      );

      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        username: response.user.name,
        userEmail: response.user.email,
        userAvatar: response.user.avatar,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        accessTokenExpiresAt: response.accessTokenExpiresAt,
        refreshTokenExpiresAt: response.refreshTokenExpiresAt,
      );
    } on AuthException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Error inesperado: ${e.toString()}',
      );
    }
  }

  /// Cierra la sesión del usuario
  ///
  /// Flujo:
  /// 1. Llama a `AuthService.logout()` para notificar al backend
  ///    (el backend invalida los tokens en su lista negra)
  /// 2. Limpia todos los datos de SharedPreferences (`_clearAuthState()`)
  /// 3. Resetea el estado a `AuthState()` vacío con `isAuthenticated: false`
  ///
  /// Después del logout:
  /// - Usuario redirigido a LoginPage
  /// - Tokens invalidados en el servidor
  /// - No se puede hacer auto-refresh
  ///
  /// Ejemplo de uso:
  /// ```dart
  /// await ref.read(authProvider.notifier).logout();
  /// // Navigator redirige a LoginPage automáticamente
  /// ```
  Future<void> logout() async {
    // Intentar hacer logout en el servidor
    await _authService.logout(state.accessToken, state.refreshToken);

    await _clearAuthState();
    state = const AuthState();
  }

  /// Renueva el access token usando el refresh token
  ///
  /// 🔄 Auto-refresh de tokens:
  /// Este método se llama automáticamente cuando:
  /// - El access token expira (< 1 minuto de vida)
  /// - Un request HTTP recibe 401 (Unauthorized)
  /// - La app se inicia y el access token está expirado
  ///
  /// Flujo:
  /// 1. Verifica que existe refresh token
  /// 2. Llama a `AuthService.refreshTokens()` → POST `/auth/refresh-tokens`
  /// 3. Backend devuelve nuevos access token y refresh token
  /// 4. Guarda nuevos tokens en SharedPreferences
  /// 5. Actualiza estado con nuevos tokens
  ///
  /// 🔐 Política de sesión permanente:
  /// - Si el refresh falla (token inválido, expirado, error de red):
  ///   → NO hace logout automático
  ///   → Mantiene sesión local (usuario ve su UI)
  ///   → Usuario debe hacer logout manual cuando quiera
  ///
  /// Returns:
  /// - `true` si el refresh fue exitoso
  /// - `false` si falló (pero mantiene sesión local)
  ///
  /// Llamado por:
  /// - `AuthInterceptor` en requests HTTP con 401
  /// - `_loadAuthState()` al iniciar app
  Future<bool> refreshTokens() async {
    if (state.refreshToken == null) {
      debugPrint(
        '[AuthProvider] ⚠️ No hay refresh token - mantener sesión local',
      );
      return false;
    }

    try {
      final response = await _authService.refreshTokens(state.refreshToken!);

      await _saveAuthState(
        isAuthenticated: true,
        username: state.username,
        userEmail: state.userEmail,
        userAvatar: state.userAvatar,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        accessTokenExpiresAt: response.accessTokenExpiresAt,
        refreshTokenExpiresAt: response.refreshTokenExpiresAt,
      );

      state = state.copyWith(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        accessTokenExpiresAt: response.accessTokenExpiresAt,
        refreshTokenExpiresAt: response.refreshTokenExpiresAt,
      );

      debugPrint('[AuthProvider] ✅ Tokens refrescados exitosamente');
      return true;
    } on AuthException catch (e) {
      debugPrint('[AuthProvider] ❌ Error al refrescar tokens: $e');
      // 🔐 NO hacer logout automático - mantener sesión local
      // El usuario debe cerrar sesión manualmente si lo desea
      return false;
    } catch (e) {
      debugPrint('[AuthProvider] ❌ Error inesperado al refrescar: $e');
      // 🔐 NO hacer logout automático
      return false;
    }
  }

  /// Actualiza el perfil del usuario localmente y en el backend
  ///
  /// Este método actualiza los datos del usuario en:
  /// 1. El backend mediante PUT /auth/profile
  /// 2. El estado de Riverpod (para UI reactiva)
  /// 3. SharedPreferences (para persistencia local)
  ///
  /// Parámetros opcionales (solo se actualizan los que se proporcionen):
  /// - [username]: Nuevo nombre de usuario
  /// - [firstName]: Nuevo nombre
  /// - [lastName]: Nuevo apellido
  /// - [userEmail]: Nuevo email
  /// - [userAvatar]: Nueva URL del avatar
  ///
  /// Throws: AuthException si falla la actualización en el backend
  ///
  /// Ejemplo de uso:
  /// ```dart
  /// await ref.read(authProvider.notifier).updateUserProfile(
  ///   firstName: 'John',
  ///   lastName: 'Doe',
  ///   userAvatar: 'https://i.pravatar.cc/150?img=10',
  /// );
  /// ```
  Future<void> updateUserProfile({
    String? username,
    String? firstName,
    String? lastName,
    String? userEmail,
    String? userAvatar,
  }) async {
    // Verificar que el usuario esté autenticado
    if (!state.isAuthenticated || state.accessToken == null) {
      throw AuthException('Usuario no autenticado');
    }

    try {
      // Llamar al backend para actualizar el perfil
      final updatedUser = await _authService.updateProfile(
        accessToken: state.accessToken!,
        username: username,
        firstName: firstName,
        lastName: lastName,
        email: userEmail,
        avatar: userAvatar,
      );

      // Actualizar estado con los datos del backend
      state = state.copyWith(
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        userEmail: updatedUser.email,
        userAvatar: updatedUser.avatar,
      );

      // Persistir en SharedPreferences
      await _saveAuthState(
        isAuthenticated: true,
        username: state.username,
        firstName: state.firstName,
        lastName: state.lastName,
        userEmail: state.userEmail,
        userAvatar: state.userAvatar,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
        refreshTokenExpiresAt: state.refreshTokenExpiresAt,
      );

      debugPrint('[AuthProvider] ✅ Perfil actualizado exitosamente');
    } on AuthException catch (e) {
      debugPrint('[AuthProvider] ❌ Error al actualizar perfil: $e');
      rethrow;
    } catch (e) {
      debugPrint('[AuthProvider] ❌ Error inesperado: $e');
      throw AuthException('Error al actualizar perfil: ${e.toString()}');
    }
  }
}

/// Provider global del estado de autenticación
///
/// Este es el provider principal que se usa en toda la app para:
/// - Leer el estado de autenticación: `ref.watch(authProvider)`
/// - Ejecutar acciones: `ref.read(authProvider.notifier).login()`
///
/// Ejemplo de uso en widgets:
/// ```dart
/// // Leer estado
/// final authState = ref.watch(authProvider);
/// if (authState.isAuthenticated) {
///   return HomePage();
/// }
///
/// // Ejecutar login
/// await ref.read(authProvider.notifier).login(email, password);
/// ```
final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);

/// Provider para acceder al interceptor HTTP con auto-refresh de tokens
///
/// Este provider crea un AuthInterceptor que:
/// - Se actualiza automáticamente cuando cambian los tokens
/// - Usa callbacks para refrescar tokens cuando expiran
/// - Obtiene el access token actual del estado de autenticación
final authInterceptorProvider = Provider<AuthInterceptor>((ref) {
  // Obtener el notifier para acceder a los métodos
  final notifier = ref.watch(authProvider.notifier);

  // Obtener el estado actual para reaccionar a cambios de tokens
  final authState = ref.watch(authProvider);

  // Crear el interceptor con los callbacks necesarios
  return AuthInterceptor(
    refreshTokenCallback: () async {
      return await notifier.refreshTokens();
    },
    getAccessTokenCallback: () {
      return authState.accessToken;
    },
  );
});
