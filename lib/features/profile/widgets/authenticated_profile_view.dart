import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';
import 'package:proyecto_1/providers/auth_provider.dart';
import 'package:proyecto_1/features/settings/settings_page.dart';
import 'package:proyecto_1/features/home/home_page.dart';
import 'profile_avatar.dart';
import 'profile_option.dart';

/// Vista para usuarios autenticados
///
/// Muestra avatar, nombre, email y opciones del perfil.
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
          ProfileAvatar(userName: authState.userName),

          const SizedBox(height: 16),

          // Nombre
          Text(
            authState.userName ?? context.loc?.user ?? 'User',
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
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(context.loc?.comingSoon ?? 'Coming soon'),
                ),
              );
            },
          ),

          ProfileOption(
            icon: Icons.shopping_bag_outlined,
            title: context.loc?.myOrders ?? 'My Orders',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(context.loc?.comingSoon ?? 'Coming soon'),
                ),
              );
            },
          ),

          ProfileOption(
            icon: Icons.favorite_outline,
            title: context.loc?.favorites ?? 'Favorites',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(context.loc?.comingSoon ?? 'Coming soon'),
                ),
              );
            },
          ),

          ProfileOption(
            icon: Icons.location_on_outlined,
            title: context.loc?.addresses ?? 'Addresses',
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(context.loc?.comingSoon ?? 'Coming soon'),
                ),
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
                    context.loc?.logoutConfirmMessage(
                          authState.userName ?? context.loc?.user ?? 'User',
                        ) ??
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
