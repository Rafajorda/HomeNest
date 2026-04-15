// ========================================
// BACKUP - Auth Provider con login simulado
// ========================================
// Este es el provider original que usaba credenciales hardcodeadas
// Se mantiene como backup por si necesitas volver atrás

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthState {
  final bool isLoading;
  final String? errorMessage;
  final bool isAuthenticated;
  final String? userName;
  final String? userEmail;

  const AuthState({
    this.isLoading = false,
    this.errorMessage,
    this.isAuthenticated = false,
    this.userName,
    this.userEmail,
  });

  AuthState copyWith({
    bool? isLoading,
    String? errorMessage,
    bool? isAuthenticated,
    String? userName,
    String? userEmail,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      userName: userName ?? this.userName,
      userEmail: userEmail ?? this.userEmail,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    // Cargar estado de autenticación al inicializar
    _loadAuthState();
    return const AuthState();
  }

  // Cargar el estado guardado
  Future<void> _loadAuthState() async {
    final prefs = await SharedPreferences.getInstance();
    final isAuthenticated = prefs.getBool('isAuthenticated') ?? false;
    final userName = prefs.getString('userName');
    final userEmail = prefs.getString('userEmail');

    if (isAuthenticated) {
      state = state.copyWith(
        isAuthenticated: true,
        userName: userName,
        userEmail: userEmail,
      );
    }
  }

  // Guardar el estado
  Future<void> _saveAuthState({
    required bool isAuthenticated,
    String? userName,
    String? userEmail,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isAuthenticated', isAuthenticated);
    if (userName != null) await prefs.setString('userName', userName);
    if (userEmail != null) await prefs.setString('userEmail', userEmail);
  }

  // Limpiar el estado guardado
  Future<void> _clearAuthState() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('isAuthenticated');
    await prefs.remove('userName');
    await prefs.remove('userEmail');
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    await Future.delayed(const Duration(seconds: 2));

    if (email == 'test@test.com' && password == '123456') {
      await _saveAuthState(
        isAuthenticated: true,
        userName: 'Usuario Test',
        userEmail: email,
      );
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        userName: 'Usuario Test',
        userEmail: email,
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Credenciales incorrectas',
      );
    }
  }

  Future<void> register(String name, String email, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    await Future.delayed(const Duration(seconds: 2));

    if (email.contains('@') && password.length >= 6) {
      await _saveAuthState(
        isAuthenticated: true,
        userName: name,
        userEmail: email,
      );
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        userName: name,
        userEmail: email,
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Error al registrar usuario. Verifica los datos.',
      );
    }
  }

  Future<void> logout() async {
    await _clearAuthState();
    state = const AuthState();
  }
}

final authProviderOld = NotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);
