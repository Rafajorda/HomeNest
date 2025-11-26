import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:proyecto_1/providers/auth_provider.dart';
import 'package:proyecto_1/l10n/app_localizations.dart';

/// Widget que muestra un saludo personalizado al usuario autenticado
///
/// Características:
/// - Aparece solo si el usuario está autenticado
/// - Se muestra durante 4 segundos al entrar a home
/// - Desaparece con animación de fade out
/// - Muestra avatar con inicial, nombre y email
/// - Diseño con gradiente del color primario del tema
///
/// Ciclo de vida:
/// 1. Usuario entra a home autenticado
/// 2. Aparece el saludo
/// 3. Después de 4 segundos, fade out
/// 4. Se oculta completamente
class UserGreeting extends ConsumerStatefulWidget {
  const UserGreeting({super.key});

  @override
  ConsumerState<UserGreeting> createState() => _UserGreetingState();
}

class _UserGreetingState extends ConsumerState<UserGreeting> {
  /// Controla la visibilidad del widget
  /// true = visible, false = oculto
  bool _isVisible = true;

  @override
  void initState() {
    super.initState();
    // Programar ocultación automática después de 4 segundos
    Future.delayed(const Duration(seconds: 4), () {
      // Verificar que el widget sigue montado antes de setState
      if (mounted) {
        setState(() {
          _isVisible = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final theme = Theme.of(context);
    final loc = AppLocalizations.of(context)!;

    // No mostrar si:
    // - Usuario no está autenticado (guest)
    // - Ya pasó el tiempo y _isVisible es false
    if (!authState.isAuthenticated || !_isVisible) {
      return const SizedBox.shrink();
    }

    return AnimatedOpacity(
      // Transición suave de visible (1.0) a invisible (0.0)
      opacity: _isVisible ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 500),
      child: Container(
        padding: const EdgeInsets.all(16.0),
        margin: const EdgeInsets.all(8.0),
        // Gradiente decorativo con color primario del tema
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              theme.colorScheme.primary,
              theme.colorScheme.primary.withValues(alpha: 0.7),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            // Avatar circular con imagen o inicial del nombre
            CircleAvatar(
              backgroundColor: theme.colorScheme.surface,
              // La imagen se superpone cuando carga exitosamente
              foregroundImage:
                  authState.userAvatar != null &&
                      authState.userAvatar!.isNotEmpty
                  ? NetworkImage(authState.userAvatar!)
                  : null,
              onForegroundImageError: (exception, stackTrace) {
                debugPrint('Error loading avatar in greeting: $exception');
              },
              // Mostrar inicial siempre como child (placeholder mientras carga)
              child: Text(
                authState.displayName.substring(0, 1).toUpperCase(),
                style: TextStyle(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Información del usuario (nombre y email)
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Saludo personalizado usando i18n
                  // Ejemplo: "¡Hola, Juan!" o "Hello, John!"
                  Text(
                    loc.hello(authState.displayName),
                    style: TextStyle(
                      color: theme.colorScheme.onPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  // Email del usuario (opcional)
                  if (authState.userEmail != null)
                    Text(
                      authState.userEmail!,
                      style: TextStyle(
                        color: theme.colorScheme.onPrimary.withValues(
                          alpha: 0.8,
                        ),
                        fontSize: 12,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),

            // Icono de usuario verificado
            Icon(
              Icons.verified_user,
              color: theme.colorScheme.onPrimary,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
