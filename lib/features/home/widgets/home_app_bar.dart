import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';
import 'package:proyecto_1/providers/auth_provider.dart';

/// AppBar personalizada para la pantalla Home
///
/// Características:
/// - **Título**: Muestra el nombre de la app (localizado)
/// - **Iconos de acción**:
///   - Settings (engranaje): Navega a configuración
///   - Profile (avatar o icono): Navega a perfil
///     - Si el usuario está logueado, muestra su avatar
///     - Si no está logueado, muestra icono de perfil
/// - **Tooltips**: Texto descriptivo al mantener presionado
/// - **Implementa PreferredSizeWidget**: Permite usar en Scaffold.appBar
///
/// Diseño:
/// - Altura estándar de toolbar (kToolbarHeight = 56px)
/// - Sin elevation (look más limpio según AppTheme)
/// - Usa colores del tema actual (light/dark)
///
/// Ejemplo de uso:
/// ```dart
/// Scaffold(
///   appBar: HomeAppBar(
///     onSettingsTap: () => Navigator.push(...SettingsPage),
///     onProfileTap: () => Navigator.push(...ProfilePage),
///   ),
/// )
/// ```
class HomeAppBar extends ConsumerWidget implements PreferredSizeWidget {
  /// Callback cuando se presiona el icono de configuración
  final VoidCallback onSettingsTap;

  /// Callback cuando se presiona el icono de perfil
  final VoidCallback onProfileTap;

  const HomeAppBar({
    super.key,
    required this.onSettingsTap,
    required this.onProfileTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return AppBar(
      title: Text(context.loc!.appTitle),
      actions: [
        IconButton(
          icon: const Icon(Icons.settings),
          tooltip: context.loc!.settings,
          onPressed: onSettingsTap,
        ),
        // Botón de perfil: muestra avatar si está logueado, icono si no
        IconButton(
          icon: authState.isAuthenticated && authState.userAvatar != null
              ? CircleAvatar(
                  radius: 16,
                  foregroundImage: NetworkImage(authState.userAvatar!),
                  onForegroundImageError: (exception, stackTrace) {
                    // Si falla la carga, el child se mostrará
                  },
                  child: Text(
                    authState.displayName.substring(0, 1).toUpperCase(),
                    style: const TextStyle(fontSize: 14),
                  ),
                )
              : const Icon(Icons.account_circle),
          tooltip: context.loc!.profile,
          onPressed: onProfileTap,
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
