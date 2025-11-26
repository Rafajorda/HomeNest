import 'package:flutter/material.dart';

/// GlobalKey para acceder al ScaffoldMessenger desde cualquier parte de la app
final GlobalKey<ScaffoldMessengerState> rootScaffoldMessengerKey =
    GlobalKey<ScaffoldMessengerState>();

/// Helper simple para mostrar SnackBars (legacy)
/// @deprecated Usa GeneralSnackBar para mayor consistencia
void showSnackbar(String message) {
  rootScaffoldMessengerKey.currentState?.showSnackBar(
    SnackBar(content: Text(message)),
  );
}

/// Clase helper para mostrar SnackBars consistentes en toda la aplicación.
///
/// Proporciona métodos estáticos para mostrar notificaciones de:
/// - ✅ Éxito (verde)
/// - ❌ Error (rojo)
/// - ℹ️ Información (azul)
/// - ⚠️ Advertencia (naranja)
///
/// Ejemplo de uso:
/// ```dart
/// GeneralSnackBar.success(context, 'Producto añadido a favoritos');
/// GeneralSnackBar.error(context, 'Error al cargar datos');
/// GeneralSnackBar.info(context, 'Inicia sesión para continuar');
/// ```
class GeneralSnackBar {
  // Constructor privado para evitar instanciación
  GeneralSnackBar._();

  /// Duración por defecto de los SnackBars (3 segundos)
  static const Duration _defaultDuration = Duration(seconds: 3);

  /// Muestra un SnackBar de éxito (fondo verde)
  static void success(
    BuildContext context,
    String message, {
    Duration duration = _defaultDuration,
  }) {
    final theme = Theme.of(context);
    _show(
      context,
      message,
      backgroundColor: theme.colorScheme.primary,
      icon: Icons.check_circle,
      duration: duration,
    );
  }

  /// Muestra un SnackBar de error (fondo rojo)
  static void error(
    BuildContext context,
    String message, {
    Duration duration = _defaultDuration,
  }) {
    final theme = Theme.of(context);
    _show(
      context,
      message,
      backgroundColor: theme.colorScheme.error,
      icon: Icons.error,
      duration: duration,
    );
  }

  /// Muestra un SnackBar de información (fondo azul)
  static void info(
    BuildContext context,
    String message, {
    Duration duration = _defaultDuration,
  }) {
    final theme = Theme.of(context);
    _show(
      context,
      message,
      backgroundColor: theme.colorScheme.secondary,
      icon: Icons.info,
      duration: duration,
    );
  }

  /// Muestra un SnackBar de advertencia (fondo naranja)
  static void warning(
    BuildContext context,
    String message, {
    Duration duration = _defaultDuration,
  }) {
    final theme = Theme.of(context);
    _show(
      context,
      message,
      backgroundColor: theme.colorScheme.tertiary,
      icon: Icons.warning,
      duration: duration,
    );
  }

  /// Método interno para mostrar el SnackBar con configuración personalizada
  static void _show(
    BuildContext context,
    String message, {
    required Color backgroundColor,
    required IconData icon,
    required Duration duration,
  }) {
    final theme = Theme.of(context);
    final textColor = theme.colorScheme.onPrimary;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: textColor),
            const SizedBox(width: 12),
            Expanded(
              child: Text(message, style: TextStyle(color: textColor)),
            ),
          ],
        ),
        backgroundColor: backgroundColor,
        duration: duration,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }
}
