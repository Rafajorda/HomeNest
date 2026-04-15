import 'package:flutter/material.dart';

/// Widget general para mostrar estados vacíos de forma consistente.
///
/// Se usa cuando no hay datos disponibles (lista vacía, sin favoritos, sin resultados, etc.)
/// Muestra un icono, título, subtítulo opcional y botón de acción opcional.
///
/// Ejemplo de uso:
/// ```dart
/// GeneralEmptyState(
///   icon: Icons.favorite_border,
///   title: 'No tienes favoritos',
///   subtitle: 'Añade productos a favoritos para verlos aquí',
///   actionLabel: 'Explorar productos',
///   onAction: () => Navigator.push(...),
/// )
/// ```
class GeneralEmptyState extends StatelessWidget {
  /// Icono que representa el estado vacío
  final IconData icon;

  /// Título principal del estado vacío
  final String title;

  /// Subtítulo descriptivo opcional
  final String? subtitle;

  /// Texto del botón de acción (opcional)
  final String? actionLabel;

  /// Callback que se ejecuta al presionar el botón de acción
  final VoidCallback? onAction;

  /// Tamaño del icono
  final double iconSize;

  const GeneralEmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
    this.iconSize = 80.0,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icono grande con color secundario
            Icon(
              icon,
              size: iconSize,
              color: Theme.of(
                context,
              ).colorScheme.secondary.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 24),

            // Título principal
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),

            // Subtítulo descriptivo (opcional)
            if (subtitle != null) ...[
              const SizedBox(height: 12),
              Text(
                subtitle!,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(
                    context,
                  ).colorScheme.onSurface.withValues(alpha: 0.6),
                ),
              ),
            ],

            // Botón de acción (opcional)
            if (onAction != null && actionLabel != null) ...[
              const SizedBox(height: 32),
              ElevatedButton.icon(
                onPressed: onAction,
                icon: const Icon(Icons.arrow_forward),
                label: Text(actionLabel!),
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
