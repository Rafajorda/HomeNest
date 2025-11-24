import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';
import 'package:proyecto_1/providers/auth_provider.dart';
import 'package:proyecto_1/features/home/home_page.dart';
import 'widgets/widgets.dart';

/// Página de registro de nuevos usuarios
///
/// Funcionalidades:
/// - Formulario con username, email y contraseña
/// - Validación de campos vacíos
/// - Integración con AuthProvider (Riverpod)
/// - Estado de carga durante registro
/// - Manejo de errores con SnackBar
/// - Navegación a home tras registro exitoso
class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final usernameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  @override
  void dispose() {
    usernameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  /// Maneja el proceso de registro
  ///
  /// Pasos:
  /// 1. Obtiene y valida username, email y password
  /// 2. Llama al método register() del AuthProvider
  /// 3. Si es exitoso, navega a home eliminando registro/login del stack
  /// 4. Si hay error, muestra SnackBar rojo con el mensaje
  Future<void> _handleRegister() async {
    final username = usernameController.text.trim();
    final email = emailController.text.trim();
    final password = passwordController.text.trim();

    if (username.isEmpty || email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            context.loc?.completeAllFields ?? 'Please complete all fields',
          ),
          backgroundColor: Theme.of(context).colorScheme.secondary,
        ),
      );
      return;
    }

    final authNotifier = ref.read(authProvider.notifier);
    await authNotifier.register(username, email, password);

    // Verificar el resultado
    final authState = ref.read(authProvider);

    if (!mounted) return;

    if (authState.isAuthenticated) {
      // Registro exitoso - navegar a home y eliminar registro/login del stack
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const MyHomePage()),
        (route) => false,
      );
    } else if (authState.errorMessage != null) {
      // Mostrar error
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authState.errorMessage!),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(context.loc?.register ?? 'Registro'),
        // Siempre mostrar botón de retroceso
        automaticallyImplyLeading: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // 🔹 CAMPO DE USERNAME
            AuthTextField(
              controller: usernameController,
              labelText: 'Username',
              icon: Icons.person,
              enabled: !authState.isLoading,
            ),
            const SizedBox(height: 16),

            // 🔹 CAMPO DE EMAIL
            AuthTextField(
              controller: emailController,
              labelText: context.loc?.email ?? 'Email',
              icon: Icons.email,
              keyboardType: TextInputType.emailAddress,
              enabled: !authState.isLoading,
            ),
            const SizedBox(height: 16),

            // 🔹 CAMPO DE CONTRASEÑA
            AuthTextField(
              controller: passwordController,
              labelText: context.loc?.password ?? 'Password',
              icon: Icons.lock,
              obscureText: true,
              enabled: !authState.isLoading,
              onSubmitted: (_) => _handleRegister(),
            ),
            const SizedBox(height: 24),

            // 🔹 BOTÓN DE REGISTRO
            AuthButton(
              label: context.loc?.register ?? 'Register',
              icon: Icons.person_add,
              onPressed: _handleRegister,
              isLoading: authState.isLoading,
            ),

            const SizedBox(height: 16),

            // 🔹 BOTÓN CANCELAR
            TextButton(
              onPressed: authState.isLoading
                  ? null
                  : () => Navigator.pop(context),
              child: Text(
                context.loc?.cancel ?? 'Cancel',
                style: TextStyle(
                  color: Theme.of(
                    context,
                  ).colorScheme.onSurface.withValues(alpha: 0.6),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
