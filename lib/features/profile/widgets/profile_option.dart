import 'package:flutter/material.dart';

/// Widget para una opción/item del menú de perfil
///
/// Muestra un item clickeable con icono, título y flecha derecha.
class ProfileOption extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final Color? textColor;

  const ProfileOption({
    super.key,
    required this.icon,
    required this.title,
    required this.onTap,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
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
