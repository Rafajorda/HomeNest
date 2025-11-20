import 'package:flutter/material.dart';
import 'package:proyecto_1/core/extensions/context_localization.dart';

/// AppBar personalizada para la página home
class HomeAppBar extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback onSettingsTap;
  final VoidCallback onProfileTap;

  const HomeAppBar({
    super.key,
    required this.onSettingsTap,
    required this.onProfileTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(context.loc!.appTitle),
      actions: [
        IconButton(
          icon: const Icon(Icons.settings),
          tooltip: context.loc!.settings,
          onPressed: onSettingsTap,
        ),
        IconButton(
          icon: const Icon(Icons.account_circle),
          tooltip: context.loc!.profile,
          onPressed: onProfileTap,
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
