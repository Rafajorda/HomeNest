import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';
import 'package:proyecto_1/providers/auth_provider.dart';
import 'package:proyecto_1/features/settings/settings_page.dart';
import 'package:proyecto_1/features/home/home_page.dart';
import 'package:proyecto_1/features/profile/edit_profile_page.dart';
import 'package:proyecto_1/features/orders/orders_page.dart';
import 'profile_avatar.dart';
import 'package:proyecto_1/features/favorites/favorites_page.dart';
import 'profile_option.dart';

/// Vista de perfil para usuarios autenticados
///
/// Muestra la información y opciones del usuario logueado:
///
/// **Sección superior**:
/// - Avatar circular con inicial del nombre
/// - Nombre del usuario en headlineSmall bold
/// - Email con opacidad 0.6
///
/// **Opciones del menú** (usando ProfileOption):
/// - Edit Profile → "Coming soon" SnackBar
/// - My Orders → Navega a OrdersPage
/// - Favorites → "Coming soon" SnackBar
/// - Addresses → "Coming soon" SnackBar
/// - Settings → Navega a SettingsPage
/// - Logout (en rojo) → Muestra diálogo de confirmación
///
/// **Flujo de Logout**:
/// 1. Muestra AlertDialog pidiendo confirmación
/// 2. Si confirma → `authProvider.notifier.logout()`
/// 3. Navega a HomePage eliminando todo el stack de navegación
///
/// Diseño:
/// - SingleChildScrollView para evitar overflow en pantallas pequeñas
/// - Divider antes del logout para separar visualmente
/// - Usa context.loc para i18n (soporte español/inglés)
///
/// Esta vista se muestra cuando:
/// ```dart
/// if (authState.isAuthenticated) {
///   return AuthenticatedProfileView();
/// }
/// ```
class AuthenticatedProfileView extends ConsumerWidget {
  const AuthenticatedProfileView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final theme = Theme.of(context);

    return SingleChildScrollView(
      child: Column(
        children: [
          const SizedBox(height: 32),

          // Avatar
          ProfileAvatar(
            userName: authState.displayName,
            avatarUrl: authState.userAvatar,
          ),

          const SizedBox(height: 16),

          // Nombre
          Text(
            authState.displayName,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 8),

          // Email
          Text(
            authState.userEmail ?? '',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
            ),
          ),

          const SizedBox(height: 32),

          // Opciones del perfil
          ProfileOption(
            icon: Icons.person_outline,
            title: context.loc?.editProfile ?? 'Edit Profile',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const EditProfilePage()),
              );
            },
          ),

          ProfileOption(
            icon: Icons.shopping_bag_outlined,
            title: context.loc?.myOrders ?? 'My Orders',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const OrdersPage()),
              );
            },
          ),

          ProfileOption(
            icon: Icons.favorite_outline,
            title: context.loc?.favorites ?? 'Favorites',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const FavoritesPage()),
              );
            },
          ),

          ProfileOption(
            icon: Icons.settings_outlined,
            title: context.loc?.settings ?? 'Settings',
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsPage()),
              );
            },
          ),

          const Divider(height: 32),

          // Botón de Logout
          ProfileOption(
            icon: Icons.logout,
            title: context.loc?.logout ?? 'Logout',
            textColor: theme.colorScheme.error,
            onTap: () async {
              final shouldLogout = await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: Text(context.loc?.logoutConfirmTitle ?? 'Logout'),
                  content: Text(
                    context.loc?.logoutConfirmMessage(authState.displayName) ??
                        context.loc?.areYouSureLogout ??
                        'Are you sure you want to logout?',
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: Text(context.loc?.cancel ?? 'Cancel'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: Text(context.loc?.logout ?? 'Logout'),
                    ),
                  ],
                ),
              );

              if (shouldLogout == true && context.mounted) {
                await ref.read(authProvider.notifier).logout();

                if (context.mounted) {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const MyHomePage()),
                    (route) => false,
                  );
                }
              }
            },
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
