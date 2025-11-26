import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';
import 'package:proyecto_1/providers/auth_provider.dart';
import 'package:proyecto_1/features/profile/widgets/profile_avatar.dart';

/// Página de edición de perfil del usuario
///
/// Permite al usuario actualizar:
/// - Nombre (firstName + lastName)
/// - Email
/// - URL del avatar
/// - Dirección (pendiente de implementar en backend)
///
/// Características:
/// - Muestra avatar actual en la parte superior
/// - Formulario con validación
/// - Botón de guardar cambios
/// - Loading state durante guardado
/// - SnackBar de confirmación al guardar exitosamente
/// - Actualización en backend mediante PUT /auth/profile
class EditProfilePage extends ConsumerStatefulWidget {
  const EditProfilePage({super.key});

  @override
  ConsumerState<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends ConsumerState<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();

  // Controladores para los campos del formulario
  late TextEditingController _usernameController;
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _emailController;
  late TextEditingController _avatarUrlController;

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();

    // Inicializar controladores con valores actuales
    final authState = ref.read(authProvider);

    // Debug: verificar valores del estado
    debugPrint('[EditProfile] username: ${authState.username}');
    debugPrint('[EditProfile] firstName: ${authState.firstName}');
    debugPrint('[EditProfile] lastName: ${authState.lastName}');
    debugPrint('[EditProfile] userEmail: ${authState.userEmail}');
    debugPrint('[EditProfile] userAvatar: ${authState.userAvatar}');

    // Cargar valores directamente del estado
    _usernameController = TextEditingController(text: authState.username ?? '');
    _firstNameController = TextEditingController(
      text: authState.firstName ?? '',
    );
    _lastNameController = TextEditingController(text: authState.lastName ?? '');
    _emailController = TextEditingController(text: authState.userEmail ?? '');
    _avatarUrlController = TextEditingController(
      text: authState.userAvatar ?? '',
    );
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _avatarUrlController.dispose();
    super.dispose();
  }

  /// Guarda los cambios del perfil
  ///
  /// Actualiza el perfil mediante:
  /// 1. Llamada al backend (PUT /auth/profile)
  /// 2. Actualización del estado de Riverpod
  /// 3. Persistencia en SharedPreferences
  Future<void> _saveChanges() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Actualizar perfil en backend y estado local
      await ref
          .read(authProvider.notifier)
          .updateUserProfile(
            // Username es OBLIGATORIO (siempre enviar)
            username: _usernameController.text.trim(),
            // FirstName y LastName son OPCIONALES (null si vacío)
            firstName: _firstNameController.text.trim().isEmpty
                ? null
                : _firstNameController.text.trim(),
            lastName: _lastNameController.text.trim().isEmpty
                ? null
                : _lastNameController.text.trim(),
            userEmail: _emailController.text.trim(),
            userAvatar: _avatarUrlController.text.trim().isEmpty
                ? null
                : _avatarUrlController.text.trim(),
          );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              context.loc?.profileUpdatedSuccessfully ??
                  'Profile updated successfully',
            ),
            backgroundColor: Theme.of(context).colorScheme.primary,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              context.loc?.errorUpdatingProfile(e.toString()) ??
                  'Error updating profile: $e',
            ),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(title: Text(context.loc?.editProfile ?? 'Edit Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              const SizedBox(height: 16),

              // Avatar preview
              ProfileAvatar(
                userName:
                    _firstNameController.text.isEmpty &&
                        _lastNameController.text.isEmpty
                    ? authState.username
                    : '${_firstNameController.text} ${_lastNameController.text}'
                          .trim(),
                avatarUrl: _avatarUrlController.text.isEmpty
                    ? authState.userAvatar
                    : _avatarUrlController.text,
                radius: 60,
              ),

              const SizedBox(height: 32),

              // Campo: Username (OBLIGATORIO - único)
              TextFormField(
                controller: _usernameController,
                decoration: InputDecoration(
                  labelText: context.loc?.username ?? 'Username',
                  prefixIcon: const Icon(Icons.alternate_email),
                  border: const OutlineInputBorder(),
                  hintText: context.loc?.usernameHint ?? 'johndoe',
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return context.loc?.usernameRequired ??
                        'Username is required';
                  }
                  if (value.trim().length < 3) {
                    return context.loc?.usernameMinLength ??
                        'Username must be at least 3 characters';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Campo: First Name (OPCIONAL)
              TextFormField(
                controller: _firstNameController,
                decoration: InputDecoration(
                  labelText:
                      context.loc?.firstNameOptional ?? 'First Name (optional)',
                  prefixIcon: const Icon(Icons.person),
                  border: const OutlineInputBorder(),
                ),
                onChanged: (value) {
                  // Actualizar vista previa del avatar
                  setState(() {});
                },
              ),

              const SizedBox(height: 16),

              // Campo: Last Name (OPCIONAL)
              TextFormField(
                controller: _lastNameController,
                decoration: InputDecoration(
                  labelText:
                      context.loc?.lastNameOptional ?? 'Last Name (optional)',
                  prefixIcon: const Icon(Icons.person_outline),
                  border: const OutlineInputBorder(),
                ),
                onChanged: (value) {
                  // Actualizar vista previa del avatar
                  setState(() {});
                },
              ),

              const SizedBox(height: 16),

              // Campo: Email
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: context.loc?.email ?? 'Email',
                  prefixIcon: const Icon(Icons.email),
                  border: const OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return context.loc?.required ?? 'Email is required';
                  }
                  if (!value.contains('@')) {
                    return context.loc?.invalidEmail ?? 'Invalid email';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Campo: Avatar URL
              TextFormField(
                controller: _avatarUrlController,
                decoration: InputDecoration(
                  labelText: context.loc?.avatarURL ?? 'Avatar URL',
                  prefixIcon: const Icon(Icons.image),
                  border: const OutlineInputBorder(),
                  hintText:
                      context.loc?.avatarURLHint ??
                      'https://i.pravatar.cc/150?img=10',
                ),
                keyboardType: TextInputType.url,
                onChanged: (value) {
                  // Actualizar vista previa del avatar
                  setState(() {});
                },
              ),

              const SizedBox(height: 32),

              // Botón de guardar
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isLoading ? null : _saveChanges,
                  icon: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.white,
                            ),
                          ),
                        )
                      : const Icon(Icons.save),
                  label: Text(
                    _isLoading
                        ? (context.loc?.loading ?? 'Saving...')
                        : (context.loc?.save ?? 'Save Changes'),
                  ),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Nota informativa
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primaryContainer.withValues(
                    alpha: 0.3,
                  ),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: theme.colorScheme.primary.withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      color: theme.colorScheme.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Use a valid image URL for your avatar. Example: https://i.pravatar.cc/150?img=10',
                        style: TextStyle(
                          fontSize: 12,
                          color: theme.colorScheme.onSurface.withValues(
                            alpha: 0.7,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
