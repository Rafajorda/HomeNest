import 'package:flutter/material.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';
import 'package:proyecto_1/features/login/login_page.dart';

/// Vista de perfil para usuarios NO autenticados (invitados)
///
/// Muestra una pantalla de estado vacío que invita al usuario a iniciar sesión:
/// - **Icono grande**: person_outline de 120px con opacidad 0.5
/// - **Título**: "No has iniciado sesión"
/// - **Subtítulo**: Explica beneficios de iniciar sesión (ver perfil, pedidos)
/// - **Botón Login**: Navega a LoginPage con icono de login
///
/// Diseño:
/// - Centrado verticalmente (MainAxisAlignment.center)
/// - Padding de 32px en todos los lados
/// - Textos con alineación centrada
/// - Botón con padding horizontal de 32px y vertical de 16px
///
/// Esta vista se muestra automáticamente cuando:
/// ```dart
/// if (!authState.isAuthenticated) {
///   return GuestProfileView();
/// }
/// ```
class GuestProfileView extends StatelessWidget {
  const GuestProfileView({super.key});

  @override
  Widget build(BuildContext context) {
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
}
