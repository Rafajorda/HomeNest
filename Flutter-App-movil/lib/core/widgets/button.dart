import 'package:flutter/material.dart';

/// Botón general reutilizable con estilo consistente en toda la aplicación
///
/// Características:
/// - Soporte para icono opcional
/// - Colores personalizables (o usa colores del tema)
/// - Padding y border radius configurables
/// - Estilo unificado con tipografía del tema
///
/// Ejemplo de uso:
/// ```dart
/// GeneralButton(
///   label: 'Guardar',
///   onPressed: () => print('Guardado'),
///   icon: Icons.save,
/// )
/// ```
class GeneralButton extends StatelessWidget {
  /// Texto que se muestra en el botón
  final String label;

  /// Función que se ejecuta al presionar el botón
  final VoidCallback onPressed;

  /// Icono opcional que se muestra a la izquierda del texto
  /// Si es null, no se muestra ningún icono
  final IconData? icon;

  /// Color de fondo del botón
  /// Si es null, usa colorScheme.primary del tema
  final Color? backgroundColor;

  /// Color del texto y del icono
  /// Si es null, usa colorScheme.onPrimary del tema
  final Color? textColor;

  /// Espaciado interno del botón
  /// Por defecto: 20px horizontal, 12px vertical
  final EdgeInsetsGeometry? padding;

  /// Radio de las esquinas redondeadas
  /// Por defecto: 10.0
  final double borderRadius;

  const GeneralButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.backgroundColor,
    this.textColor,
    this.padding,
    this.borderRadius = 10.0,
  });

  @override
  Widget build(BuildContext context) {
    // Obtener colores efectivos (personalizados o del tema)
    final Color effectiveBg =
        backgroundColor ?? Theme.of(context).colorScheme.primary;
    final Color effectiveText =
        textColor ?? Theme.of(context).colorScheme.onPrimary;

    // Estilo de texto basado en el tema con color efectivo
    final textStyle = Theme.of(context).textTheme.labelLarge?.copyWith(
      inherit: true,
      color: effectiveText,
      fontWeight: FontWeight.bold,
    );

    return ElevatedButton.icon(
      onPressed: onPressed,
      // Mostrar icono solo si está definido
      icon: icon != null
          ? Icon(icon, color: effectiveText)
          : const SizedBox.shrink(),
      label: Text(label, style: textStyle),
      style: ElevatedButton.styleFrom(
        backgroundColor: effectiveBg,
        foregroundColor: effectiveText,
        padding:
            padding ?? const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        textStyle: textStyle,
      ),
    );
  }
}
