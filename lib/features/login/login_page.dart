import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';
import 'package:proyecto_1/providers/auth_provider.dart';
import 'package:proyecto_1/features/login/register_page.dart';
import 'package:proyecto_1/features/home/home_page.dart';
import 'widgets/widgets.dart';

/// Página de inicio de sesión (Login)
///
/// Funcionalidades:
/// - Formulario con email y contraseña
/// - Validación de campos vacíos
/// - Integración con AuthProvider (Riverpod)
/// - Navegación a registro
/// - Estado de carga durante autenticación
/// - Manejo de errores con SnackBar
/// - Navegación a home tras login exitoso
/// - Previene retroceso durante carga (PopScope)
class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  /// Controlador del campo de email
  /// Se debe liberar en dispose() para evitar memory leaks
  final emailController = TextEditingController();

  /// Controlador del campo de contraseña
  /// Se debe liberar en dispose() para evitar memory leaks
  final passwordController = TextEditingController();

  @override
  void dispose() {
    // Liberar recursos de los controladores
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  /// Maneja el proceso de inicio de sesión
  ///
  /// Pasos:
  /// 1. Obtiene y valida email/password
  /// 2. Llama al método login() del AuthProvider
  /// 3. Si es exitoso, navega a home eliminando login del stack
  /// 4. Si hay error, muestra SnackBar rojo con el mensaje
  Future<void> _handleLogin() async {
    // Obtener valores de los campos y eliminar espacios
    final email = emailController.text.trim();
    final password = passwordController.text.trim();

    // Validación básica: campos no vacíos
    if (email.isEmpty || password.isEmpty) {
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

    // Llamar al método login del AuthProvider
    final authNotifier = ref.read(authProvider.notifier);
    await authNotifier.login(email, password);

    // Verificar el resultado del login
    final authState = ref.read(authProvider);

    // Verificar que el widget sigue montado antes de usar context
    if (!mounted) return;

    if (authState.isAuthenticated) {
      // ✅ Login exitoso - navegar a home y eliminar login del stack
      // pushAndRemoveUntil con (route) => false elimina todas las rutas anteriores
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const MyHomePage()),
        (route) => false, // Eliminar todas las rutas previas
      );
    } else if (authState.errorMessage != null) {
      // ❌ Mostrar error en SnackBar rojo
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authState.errorMessage!),
          backgroundColor: Theme.of(context).colorScheme.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Observar cambios en el estado de autenticación
    final authState = ref.watch(authProvider);

    return PopScope(
      // Permitir volver atrás SOLO si no está cargando
      // Esto previene que el usuario salga durante la autenticación
      canPop: !authState.isLoading,
      child: Scaffold(
        appBar: AppBar(
          title: Text(context.loc?.login ?? 'Login'),
          // Ocultar botón de retroceso durante carga
          automaticallyImplyLeading: !authState.isLoading,
        ),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
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
                onSubmitted: (_) => _handleLogin(),
              ),
              const SizedBox(height: 24),

              // 🔹 BOTÓN DE LOGIN
              AuthButton(
                label: context.loc?.login ?? 'Login',
                icon: Icons.login,
                onPressed: _handleLogin,
                isLoading: authState.isLoading,
              ),

              const SizedBox(height: 16),

              // 🔹 ENLACE A REGISTRO
              // Navega a RegisterPage
              // Deshabilitado durante carga
              TextButton(
                onPressed: authState.isLoading
                    ? null
                    : () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const RegisterPage(),
                          ),
                        );
                      },
                child: Text(
                  context.loc?.noAccount ?? "Don't have an account? Sign up",
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
