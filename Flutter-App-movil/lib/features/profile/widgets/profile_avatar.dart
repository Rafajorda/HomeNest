import 'package:flutter/material.dart';

/// Avatar circular del usuario con imagen personalizada o inicial de su nombre
///
/// Características:
/// - **Imagen personalizada**: Muestra avatarUrl si está disponible (URL externa o backend)
/// - **Inicial del nombre**: Fallback a CircleAvatar con primera letra
/// - Tamaño de letra proporcional al radio (80%)
/// - Fallback a "U" si no hay avatarUrl ni userName
/// - Radio configurable (por defecto 60)
///
/// Prioridad de visualización:
/// 1. avatarUrl (imagen personalizada)
/// 2. userName inicial en CircleAvatar
/// 3. "U" por defecto
///
/// Se usa en:
/// - Pantalla de perfil (grande: radius 60)
/// - Barra de navegación (pequeño: radius 20-25)
/// - UserGreeting widget
///
/// Ejemplo de uso:
/// ```dart
/// // Avatar con imagen
/// ProfileAvatar(avatarUrl: 'https://i.pravatar.cc/150?img=10', radius: 60)
///
/// // Avatar con inicial
/// ProfileAvatar(userName: 'Juan', radius: 60)
///
/// // Avatar pequeño
/// ProfileAvatar(userName: 'Juan', radius: 20)
/// ```
class ProfileAvatar extends StatelessWidget {
  /// Nombre del usuario (se usa la primera letra si no hay avatarUrl)
  /// Si es null, se muestra "U" por defecto
  final String? userName;

  /// Radio del avatar en píxeles
  /// Por defecto: 60 (apropiado para pantalla de perfil)
  final double radius;

  /// URL del avatar personalizado (opcional)
  /// Puede ser URL externa como https://i.pravatar.cc/150?img=10
  /// o una ruta del backend
  final String? avatarUrl;

  const ProfileAvatar({
    super.key,
    this.userName,
    this.radius = 60,
    this.avatarUrl,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final initial = userName?.substring(0, 1).toUpperCase() ?? 'U';

    // Si hay URL de avatar, intentar cargar imagen con fallback
    if (avatarUrl != null && avatarUrl!.isNotEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundColor: theme.colorScheme.primary,
        // La imagen se superpone al child cuando carga exitosamente
        foregroundImage: NetworkImage(avatarUrl!),
        onForegroundImageError: (exception, stackTrace) {
          // Si falla la carga, se mantiene visible el child (inicial)
          debugPrint('Error loading avatar: $exception');
        },
        // Mostrar inicial mientras carga la imagen (child debe ir al final)
        child: Text(
          initial,
          style: TextStyle(
            fontSize: radius * 0.8,
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.onPrimary,
          ),
        ),
      );
    }

    // Fallback: mostrar inicial del nombre
    return CircleAvatar(
      radius: radius,
      backgroundColor: theme.colorScheme.primary,
      child: Text(
        initial,
        style: TextStyle(
          fontSize: radius * 0.8,
          fontWeight: FontWeight.bold,
          color: theme.colorScheme.onPrimary,
        ),
      ),
    );
  }
}
