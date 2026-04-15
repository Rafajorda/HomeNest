import 'package:flutter/material.dart';

/// Widget general para mostrar indicadores de carga consistentes en toda la aplicación.
///
/// Soporta dos modos:
/// - **fullScreen**: Ocupa toda la pantalla con overlay semi-transparente
/// - **inline**: Indicador simple para usar dentro de otros widgets
///
/// Ejemplo de uso:
/// ```dart
/// // En pantalla completa
/// GeneralLoadingIndicator(fullScreen: true, message: 'Cargando productos...')
///
/// // Inline dentro de un botón
/// GeneralLoadingIndicator(size: 20)
/// ```
class GeneralLoadingIndicator extends StatelessWidget {
  /// Tamaño del CircularProgressIndicator (por defecto 40.0)
  final double size;

  /// Si es true, muestra un overlay que ocupa toda la pantalla
  final bool fullScreen;

  /// Mensaje opcional que se muestra debajo del indicador
  final String? message;

  /// Color de fondo para el modo fullScreen (por defecto semi-transparente)
  final Color? backgroundColor;

  const GeneralLoadingIndicator({
    super.key,
    this.size = 40.0,
    this.fullScreen = false,
    this.message,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final indicator = SizedBox(
      width: size,
      height: size,
      child: CircularProgressIndicator(
        strokeWidth: size / 10, // Grosor proporcional al tamaño
      ),
    );

    // Construir contenido con indicador + mensaje opcional
    final content = Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        indicator,
        if (message != null) ...[
          SizedBox(height: size / 2),
          Text(
            message!,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: fullScreen ? Colors.white : null,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );

    // Modo pantalla completa con overlay
    if (fullScreen) {
      return Container(
        color: backgroundColor ?? Colors.black54,
        child: Center(child: content),
      );
    }

    // Modo inline simple
    return Center(child: content);
  }
}
