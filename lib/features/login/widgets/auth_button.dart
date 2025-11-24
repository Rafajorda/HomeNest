import 'package:flutter/material.dart';
import 'package:proyecto_1/core/widgets/button.dart';

/// Botón de autenticación con estado de carga
///
/// Muestra un CircularProgressIndicator cuando isLoading es true,
/// de lo contrario muestra un GeneralButton normal.
class AuthButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onPressed;
  final bool isLoading;

  const AuthButton({
    super.key,
    required this.label,
    required this.icon,
    required this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: isLoading
          ? ElevatedButton(
              onPressed: null,
              child: const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              ),
            )
          : GeneralButton(label: label, onPressed: onPressed, icon: icon),
    );
  }
}
