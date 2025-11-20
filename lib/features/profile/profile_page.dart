import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';
import 'package:proyecto_1/features/settings/settings_page.dart';
import 'package:proyecto_1/providers/auth_provider.dart';
import 'package:proyecto_1/features/home/home_page.dart';
import 'package:proyecto_1/features/login/login_page.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(context.loc?.profile ?? 'Profile')),
      body: authState.isAuthenticated
          ? _buildAuthenticatedProfile(context, ref, authState, theme)
          : _buildGuestProfile(context),
    );
  }

  Widget _buildAuthenticatedProfile(
    BuildContext context,
    WidgetRef ref,
    AuthState authState,
    ThemeData theme,
  ) {
    return SingleChildScrollView(
      child: Column(
        children: [
          const SizedBox(height: 32),

          // Avatar
          CircleAvatar(
            radius: 60,
            backgroundColor: theme.colorScheme.primary,
            child: Text(
              authState.userName?.substring(0, 1).toUpperCase() ?? 'U',
              style: TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onPrimary,
              ),
            ),
          ),

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
          _buildProfileOption(
            context: context,
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

          _buildProfileOption(
            context: context,
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

          _buildProfileOption(
            context: context,
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

          _buildProfileOption(
            context: context,
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

          _buildProfileOption(
            context: context,
            icon: Icons.settings_outlined,
            title: context.loc?.settings ?? 'Settings',
            onTap: () {
              Navigator.pop(context); // Cerrar perfil
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsPage()),
              );
            },
          ),

          const Divider(height: 32),

          // Botón de Logout
          _buildProfileOption(
            context: context,
            icon: Icons.logout,
            title: context.loc?.logout ?? 'Logout',
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
                  // Volver a HomePage - el widget UserGreeting mostrará el estado de invitado
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const MyHomePage()),
                    (route) => false,
                  );
                }
              }
            },
            textColor: theme.colorScheme.error,
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildGuestProfile(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.person_outline,
              size: 120,
              color: theme.colorScheme.primary.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 24),
            Text(
              context.loc?.notLoggedIn ?? 'Not logged in',
              style: const TextStyle(fontSize: 20),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              context.loc?.loginToSeeProfileAndOrders ??
                  'Login to see your profile and orders',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginPage()),
                );
              },
              icon: const Icon(Icons.login),
              label: Text(context.loc?.login ?? 'Login'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileOption({
    required BuildContext context,
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? textColor,
  }) {
    final theme = Theme.of(context);
    final color = textColor ?? theme.colorScheme.onSurface;

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Row(
          children: [
            Icon(icon, color: color),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: theme.textTheme.bodyLarge?.copyWith(color: color),
              ),
            ),
            Icon(Icons.chevron_right, color: color.withValues(alpha: 0.5)),
          ],
        ),
      ),
    );
  }
}
