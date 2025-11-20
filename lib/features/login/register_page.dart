import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';
import 'package:proyecto_1/core/widgets/button.dart';
import 'package:proyecto_1/providers/auth_provider.dart';
import 'package:proyecto_1/features/home/home_page.dart';

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
            TextField(
              controller: usernameController,
              enabled: !authState.isLoading,
              decoration: InputDecoration(
                labelText: 'Username',
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.person),
              ),
            ),
            const SizedBox(height: 16),

            TextField(
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              enabled: !authState.isLoading,
              decoration: InputDecoration(
                labelText: context.loc?.email ?? 'Email',
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.email),
              ),
            ),
            const SizedBox(height: 16),

            TextField(
              controller: passwordController,
              obscureText: true,
              enabled: !authState.isLoading,
              decoration: InputDecoration(
                labelText: context.loc?.password ?? 'Password',
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.lock),
              ),
              onSubmitted: (_) => _handleRegister(),
            ),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: authState.isLoading
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
                  : GeneralButton(
                      label: context.loc?.register ?? 'Register',
                      onPressed: _handleRegister,
                      icon: Icons.person_add,
                    ),
            ),

            const SizedBox(height: 16),

            // Botón "Cancelar" para volver (siempre visible)
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
