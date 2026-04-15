import 'package:flutter/material.dart';

class GeneralDropdown<T> extends StatelessWidget {
  final String title;
  final T value;
  final ValueChanged<T?> onChanged;
  final List<DropdownMenuItem<T>> items;
  final IconData? icon;

  const GeneralDropdown({
    super.key,
    required this.title,
    required this.value,
    required this.onChanged,
    required this.items,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: icon != null ? Icon(icon) : null,
      title: Text(title),
      trailing: DropdownButton<T>(
        value: value,
        onChanged: onChanged,
        items: items,
      ),
    );
  }
}
