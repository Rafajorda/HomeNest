import 'package:flutter/material.dart';

/// Widget general para mostrar estados de error de forma consistente.
///
/// Muestra un icono, mensaje de error y opcionalmente un botón de reintento.
/// Útil para mostrar errores de red, permisos, o cualquier fallo en la carga de datos.
///
/// Ejemplo de uso:
/// ```dart
/// GeneralErrorView(
///   message: 'No se pudieron cargar los productos',
///   onRetry: () => _loadProducts(),
/// )
/// ```
class GeneralErrorView extends StatelessWidget {
  /// Mensaje de error a mostrar al usuario
  final String message;

  /// Icono que representa el error (por defecto error_outline)
  final IconData icon;

  /// Texto del botón de reintento (opcional)
  final String? retryLabel;

  /// Callback que se ejecuta al presionar el botón de reintento
  final VoidCallback? onRetry;

  /// Tamaño del icono de error
  final double iconSize;

  const GeneralErrorView({
    super.key,
    required this.message,
    this.icon = Icons.error_outline,
    this.retryLabel,
    this.onRetry,
    this.iconSize = 64.0,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icono de error
            Icon(
              icon,
              size: iconSize,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(height: 16),

            // Mensaje de error
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Theme.of(context).colorScheme.error,
              ),
            ),

            // Botón de reintento (solo si se proporciona callback)
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: Text(retryLabel ?? 'Reintentar'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
