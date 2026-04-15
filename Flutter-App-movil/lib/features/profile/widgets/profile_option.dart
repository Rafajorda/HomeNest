import 'package:flutter/material.dart';

/// Widget reutilizable para opciones del menú de perfil
///
/// Renderiza un item clickeable tipo ListTile con:
/// - **Icono izquierdo**: Representa la acción (person, shopping_bag, etc.)
/// - **Título central**: Texto de la opción (expandible con Expanded)
/// - **Flecha derecha**: Indica que es navegable (con opacidad 0.5)
/// - **InkWell**: Efecto ripple al tocar
///
/// Características:
/// - Padding horizontal/vertical de 16px para área táctil cómoda
/// - Color del texto personalizable (ej: rojo para logout)
/// - Si no se pasa textColor, usa el color del tema actual
///
/// Casos de uso típicos:
/// - "Edit Profile" con Icons.person_outline
/// - "My Orders" con Icons.shopping_bag_outlined
/// - "Settings" con Icons.settings_outlined
/// - "Logout" con Icons.logout y color rojo
///
/// Ejemplo de uso:
/// ```dart
/// ProfileOption(
///   icon: Icons.logout,
///   title: 'Cerrar sesión',
///   textColor: Colors.red,
///   onTap: () => _handleLogout(),
/// )
/// ```
class ProfileOption extends StatelessWidget {
  /// Icono que se muestra a la izquierda
  final IconData icon;

  /// Texto de la opción
  final String title;

  /// Callback ejecutado al tocar el item
  final VoidCallback onTap;

  /// Color del texto e icono (opcional, usa onSurface por defecto)
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
