import 'package:flutter/material.dart';

/// Widget para el avatar del usuario con inicial
///
/// Muestra un CircleAvatar con la primera letra del nombre de usuario.
class ProfileAvatar extends StatelessWidget {
  final String? userName;
  final double radius;

  const ProfileAvatar({super.key, this.userName, this.radius = 60});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return CircleAvatar(
      radius: radius,
      backgroundColor: theme.colorScheme.primary,
      child: Text(
        userName?.substring(0, 1).toUpperCase() ?? 'U',
        style: TextStyle(
          fontSize: radius * 0.8,
          fontWeight: FontWeight.bold,
          color: theme.colorScheme.onPrimary,
        ),
      ),
    );
  }
}
