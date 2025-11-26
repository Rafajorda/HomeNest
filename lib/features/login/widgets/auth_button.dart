import 'package:flutter/material.dart';
import 'package:proyecto_1/core/widgets/button.dart';

/// Botón especializado para formularios de autenticación con estado de carga
///
/// Características:
/// - Muestra CircularProgressIndicator cuando está cargando
/// - Muestra GeneralButton normal cuando no está cargando
/// - Ancho completo (double.infinity)
/// - Botón deshabilitado durante carga (onPressed: null)
///
/// Este widget elimina código repetitivo en login_page y register_page
/// donde se necesita mostrar loading durante las operaciones de auth.
///
/// Ejemplo de uso:
/// ```dart
/// AuthButton(
///   label: 'Iniciar sesión',
///   icon: Icons.login,
///   onPressed: _handleLogin,
///   isLoading: authState.isLoading,
/// )
/// ```
class AuthButton extends StatelessWidget {
  /// Texto que se muestra en el botón
  final String label;

  /// Icono que se muestra en el botón (ej: Icons.login)
  final IconData icon;

  /// Función que se ejecuta al presionar el botón
  /// Se ignora si isLoading es true
  final VoidCallback onPressed;

  /// Si el botón debe mostrar estado de carga
  /// true = muestra CircularProgressIndicator
  /// false = muestra botón normal con label e icon
  final bool isLoading;

  const AuthButton({
    super.key,
    required this.label,
    required this.icon,
    required this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: isLoading
          ? ElevatedButton(
              onPressed: null,
              child: const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              ),
            )
          : GeneralButton(label: label, onPressed: onPressed, icon: icon),
    );
  }
}
