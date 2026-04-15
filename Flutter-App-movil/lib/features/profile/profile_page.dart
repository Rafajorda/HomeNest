import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';
import 'package:proyecto_1/providers/auth_provider.dart';
import 'widgets/widgets.dart';

/// Pantalla de perfil de usuario
///
/// Muestra información del usuario y opciones de perfil si está autenticado,
/// o una vista de invitado para iniciar sesión si no lo está.
class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(context.loc?.profile ?? 'Profile'),
        centerTitle: true,
      ),
      body: authState.isAuthenticated
          ? const AuthenticatedProfileView()
          : const GuestProfileView(),
    );
  }
}
