import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Notifier que gestiona el estado del tema (claro/oscuro) y el idioma de la app
///
/// Responsabilidades:
/// - Cargar preferencias guardadas al iniciar la app
/// - Cambiar entre modo claro y oscuro
/// - Cambiar el idioma de la interfaz (español/inglés)
/// - Persistir cambios en SharedPreferences
///
/// Usa AsyncNotifier porque la carga inicial requiere I/O asíncrono
class ThemeAndLocaleNotifier extends AsyncNotifier<ThemeAndLocaleState> {
  /// Inicializa el estado cargando preferencias guardadas
  ///
  /// Se ejecuta automáticamente al crear el provider.
  /// Retorna:
  /// - isDarkMode: false por defecto (modo claro)
  /// - locale: 'es' por defecto (español)
  @override
  Future<ThemeAndLocaleState> build() async {
    final prefs = await SharedPreferences.getInstance();
    final isDark = prefs.getBool('isDarkMode') ?? false;
    final localeCode = prefs.getString('localeCode') ?? 'es';

    return ThemeAndLocaleState(isDarkMode: isDark, locale: Locale(localeCode));
  }

  /// Carga las preferencias guardadas desde SharedPreferences
  ///
  /// Útil para refrescar el estado después de cambios externos
  /// Retorna el estado con las preferencias actuales
  Future<ThemeAndLocaleState> loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final isDark = prefs.getBool('isDarkMode') ?? false;
    final localeCode = prefs.getString('localeCode') ?? 'es';

    return ThemeAndLocaleState(isDarkMode: isDark, locale: Locale(localeCode));
  }

  /// Alterna entre modo claro y modo oscuro
  ///
  /// Actualiza el estado y guarda la preferencia.
  /// La UI se actualiza automáticamente gracias a Riverpod.
  ///
  /// Uso:
  /// ```dart
  /// ref.read(themeAndLocaleProvider.notifier).toggleTheme();
  /// ```
  Future<void> toggleTheme() async {
    state = AsyncValue.data(
      state.value!.copyWith(isDarkMode: !state.value!.isDarkMode),
    );
    await _savePreferences();
  }

  /// Cambia el idioma de la aplicación
  ///
  /// Parámetros:
  /// - [locale]: Nuevo idioma (ej: Locale('es'), Locale('en'))
  ///
  /// Actualiza el estado y guarda la preferencia.
  /// MaterialApp se reconstruye automáticamente con el nuevo idioma.
  ///
  /// Uso:
  /// ```dart
  /// ref.read(themeAndLocaleProvider.notifier).setLocale(Locale('en'));
  /// ```
  Future<void> setLocale(Locale locale) async {
    state = AsyncValue.data(state.value!.copyWith(locale: locale));
    await _savePreferences();
  }

  /// Guarda las preferencias actuales en SharedPreferences
  ///
  /// Método privado llamado automáticamente después de cada cambio.
  /// Persiste:
  /// - isDarkMode: bool
  /// - localeCode: string ('es', 'en')
  Future<void> _savePreferences() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDarkMode', state.value!.isDarkMode);
    await prefs.setString('localeCode', state.value!.locale.languageCode);
  }
}

/// Estado inmutable que contiene las preferencias de tema e idioma
///
/// Propiedades:
/// - [isDarkMode]: true = modo oscuro, false = modo claro
/// - [locale]: Idioma actual de la app (Locale('es'), Locale('en'))
///
/// Incluye:
/// - [themeMode]: Getter que convierte isDarkMode a ThemeMode de Flutter
/// - [copyWith]: Método para crear copias modificadas (patrón inmutable)
class ThemeAndLocaleState {
  /// Si el modo oscuro está activado
  final bool isDarkMode;

  /// Idioma actual de la interfaz
  final Locale locale;

  const ThemeAndLocaleState({required this.isDarkMode, required this.locale});

  /// Crea una copia del estado con valores modificados
  ///
  /// Solo actualiza los campos proporcionados, mantiene el resto.
  /// Esencial para el patrón de estado inmutable.
  ThemeAndLocaleState copyWith({bool? isDarkMode, Locale? locale}) {
    return ThemeAndLocaleState(
      isDarkMode: isDarkMode ?? this.isDarkMode,
      locale: locale ?? this.locale,
    );
  }

  /// Convierte isDarkMode a ThemeMode de Flutter
  ///
  /// Usado por MaterialApp para aplicar el tema correcto
  ThemeMode get themeMode => isDarkMode ? ThemeMode.dark : ThemeMode.light;
}

/// Provider global de tema e idioma
///
/// Uso en widgets:
/// ```dart
/// // Leer estado
/// final themeState = ref.watch(themeAndLocaleProvider);
/// final isDark = themeState.value?.isDarkMode ?? false;
///
/// // Cambiar tema
/// ref.read(themeAndLocaleProvider.notifier).toggleTheme();
///
/// // Cambiar idioma
/// ref.read(themeAndLocaleProvider.notifier).setLocale(Locale('en'));
/// ```
final themeAndLocaleProvider =
    AsyncNotifierProvider<ThemeAndLocaleNotifier, ThemeAndLocaleState>(() {
      return ThemeAndLocaleNotifier();
    });
