import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:proyecto_1/features/home/home_page.dart';
import 'package:proyecto_1/l10n/app_localizations.dart';
import 'package:proyecto_1/providers/theme_and_locale_provider.dart';
import 'package:proyecto_1/core/theme/app_theme.dart';
import 'package:proyecto_1/core/utils/snackbar.dart';

/// Punto de entrada de la aplicación HomeNest
///
/// Inicializa la app con:
/// - **Variables de entorno**: Carga .env con configuración de API
/// - **ProviderScope**: Contenedor de Riverpod para gestión de estado global
/// - **MyApp**: Widget raíz de la aplicación
///
/// ProviderScope permite usar providers en toda la app para:
/// - Estado de autenticación (authProvider)
/// - Tema y locale (themeAndLocaleProvider)
/// - Servicios (ProductService, CategoryService, etc.)
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Cargar variables de entorno desde .env
  await dotenv.load(fileName: ".env");

  runApp(const ProviderScope(child: MyApp()));
}

/// Widget raíz de la aplicación HomeNest
///
/// Configura MaterialApp con:
///
/// **Temas**:
/// - Light theme (paleta natural: verde oliva, arena, madera)
/// - Dark theme (tonos oscuros de la misma paleta)
/// - ThemeMode dinámico desde themeAndLocaleProvider (persistido)
///
/// **Localización (i18n)**:
/// - Español (es) por defecto
/// - Inglés (en) disponible
/// - Locale dinámico desde themeAndLocaleProvider (persistido)
/// - Delegates: AppLocalizations, Material, Widgets, Cupertino
///
/// **Navegación**:
/// - Home: MyHomePage (accesible sin login)
/// - Login opcional (no es pantalla inicial)
/// - Usuario puede navegar sin autenticarse
///
/// **SnackBar global**:
/// - rootScaffoldMessengerKey permite mostrar snackbars desde cualquier lugar
/// - Útil para mensajes de error/éxito en servicios HTTP
///
/// Arquitectura:
/// - ConsumerWidget para acceder a providers (Riverpod)
/// - AsyncValue para manejar estados async de themeAndLocaleProvider
/// - Valores por defecto si themeAndLocaleProvider aún no cargó
class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncThemeState = ref.watch(themeAndLocaleProvider);

    return MaterialApp(
      scaffoldMessengerKey: rootScaffoldMessengerKey,
      debugShowCheckedModeBanner: false,
      title: 'HomeNest',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: asyncThemeState.value?.themeMode ?? ThemeMode.light,
      locale: asyncThemeState.value?.locale ?? const Locale('es'),
      supportedLocales: const [Locale('en'), Locale('es')],
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      // Login es opcional - siempre iniciamos en home
      home: const MyHomePage(),
    );
  }
}
