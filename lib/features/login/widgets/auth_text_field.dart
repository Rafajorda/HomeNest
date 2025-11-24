import 'package:flutter/material.dart';

/// Widget reutilizable para campos de formulario de autenticación
///
/// Propiedades:
/// - controller: TextEditingController para el campo
/// - labelText: Etiqueta del campo
/// - icon: Icono a mostrar (prefixIcon)
/// - obscureText: Si el texto debe ocultarse (para contraseñas)
/// - keyboardType: Tipo de teclado (email, texto, etc.)
/// - enabled: Si el campo está habilitado
/// - onSubmitted: Callback cuando se presiona Enter/Done
class AuthTextField extends StatelessWidget {
  final TextEditingController controller;
  final String labelText;
  final IconData icon;
  final bool obscureText;
  final TextInputType keyboardType;
  final bool enabled;
  final ValueChanged<String>? onSubmitted;

  const AuthTextField({
    super.key,
    required this.controller,
    required this.labelText,
    required this.icon,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.enabled = true,
    this.onSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: obscureText,
      enabled: enabled,
      decoration: InputDecoration(
        labelText: labelText,
        border: const OutlineInputBorder(),
        prefixIcon: Icon(icon),
      ),
      onSubmitted: onSubmitted,
    );
  }
}
