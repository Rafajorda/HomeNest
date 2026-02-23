import 'package:flutter/material.dart';

/// Configuración de temas de la aplicación
///
/// Define dos temas:
/// - **lightTheme**: Tema claro con paleta natural (verde oliva, madera, arena)
/// - **darkTheme**: Tema oscuro con tonos más profundos de la misma paleta
///
/// Paleta de colores (tema claro):
/// - Primary: #7B8C5F (verde olivo suave)
/// - Secondary: #D9C6A5 (madera clara/beige)
/// - Surface: #FFFDF8 (blanco cálido)
/// - Background: #F5EFE6 (arena suave)
/// - OnSurface: #3E3B32 (marrón profundo para texto)
///
/// La app usa esta clase en MaterialApp:
/// ```dart
/// MaterialApp(
///   theme: AppTheme.lightTheme,
///   darkTheme: AppTheme.darkTheme,
///   themeMode: themeMode, // ThemeMode.light o ThemeMode.dark
/// )
/// ```
class AppTheme {
  // Colores de estados de pedidos (con opacidad incluida)
  static const Color orderPendingColor = Color(0xFFF57C00); // Naranja
  static const Color orderPendingLight = Color(0xFFFFE0B2); // Naranja claro
  static const Color orderProcessingColor = Color(0xFF1976D2); // Azul
  static const Color orderProcessingLight = Color(0xFFBBDEFB); // Azul claro
  static const Color orderShippedColor = Color(0xFF7B1FA2); // Púrpura
  static const Color orderShippedLight = Color(0xFFE1BEE7); // Púrpura claro
  static const Color orderCompletedColor = Color(0xFF388E3C); // Verde
  static const Color orderCompletedLight = Color(0xFFC8E6C9); // Verde claro
  static const Color orderCancelledColor = Color(0xFFD32F2F); // Rojo
  static const Color orderCancelledLight = Color(0xFFFFCDD2); // Rojo claro
  static const Color orderDefaultColor = Color(0xFF757575); // Gris
  static const Color orderDefaultLight = Color(0xFFE0E0E0); // Gris claro
  /// Tema claro con paleta natural inspirada en la naturaleza
  ///
  /// Características:
  /// - Fondo arena suave que no cansa la vista
  /// - Verde oliva como color principal (botones, énfasis)
  /// - Madera clara para elementos secundarios
  /// - Texto marrón profundo para buena legibilidad
  /// - Botones y campos con bordes redondeados (12px)
  static ThemeData lightTheme = ThemeData(
    // Color de fondo de todas las pantallas
    scaffoldBackgroundColor: const Color(0xFFF5EFE6), // Arena suave
    // Esquema de colores principal
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF7B8C5F),
      primary: const Color(0xFF7B8C5F), // Verde oliva suave
      secondary: const Color(0xFFD9C6A5), // Madera clara
      surface: const Color(0xFFFFFDF8), // Blanco cálido
      onPrimary: Colors.white,
      onSurface: const Color(0xFF3E3B32), // Marrón profundo (texto)
    ),

    // Estilo de la AppBar
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFFF5EFE6), // Mismo color que scaffold
      foregroundColor: Color(0xFF3E3B32), // Texto oscuro
      elevation: 0, // Sin sombra para look más limpio
    ),

    // Estilo de botones elevados (ElevatedButton)
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF7B8C5F), // Verde oliva
        foregroundColor: Colors.white, // Texto blanco
        minimumSize: const Size(
          double.infinity,
          48,
        ), // Ancho completo, alto 48px
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
        textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      ),
    ),

    // Estilo de campos de texto (TextField, TextFormField)
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xFFFFFDF8), // Fondo blanco cálido
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFD9C6A5)), // Borde madera
      ),
      focusedBorder: const OutlineInputBorder(
        borderSide: BorderSide(
          color: Color(0xFF7B8C5F),
        ), // Borde verde al enfocar
      ),
      labelStyle: const TextStyle(color: Color(0xFF3E3B32)), // Label marrón
    ),

    // Estilo de texto general
    textTheme: const TextTheme(
      bodyMedium: TextStyle(color: Color(0xFF3E3B32)), // Texto normal
      titleMedium: TextStyle(
        color: Color(0xFF3E3B32),
        fontWeight: FontWeight.bold,
      ),
    ),
  );

  /// Tema oscuro con tonos más profundos de la paleta natural
  ///
  /// Características:
  /// - Fondo oscuro (#1E1C18) cómodo para la vista nocturna
  /// - Verde oliva oscuro (#5A6B3F) para elementos primarios
  /// - Madera oscura (#BFAE94) para secundarios
  /// - Texto claro (#EFEDE8) para buena legibilidad
  /// - Mantiene la misma estructura que el tema claro
  static ThemeData darkTheme = ThemeData(
    // Esquema de colores oscuros
    colorScheme: ColorScheme.dark(
      primary: const Color(0xFF5A6B3F), // Verde oliva oscuro
      secondary: const Color(0xFFBFAE94), // Madera oscura
      surface: const Color(0xFF2E2B25), // Superficie oscura
      onPrimary: Colors.white,
      onSurface: const Color(0xFFEFEDE8), // Texto claro
    ),

    // Fondo oscuro del scaffold
    scaffoldBackgroundColor: const Color(0xFF1E1C18),

    // AppBar oscura
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF2E2B25),
      foregroundColor: Colors.white,
      elevation: 0,
    ),

    // Botones en tema oscuro
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF5A6B3F), // Verde oliva oscuro
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 48),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
      ),
    ),
  );
}
