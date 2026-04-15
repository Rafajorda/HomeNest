import 'package:flutter/material.dart';
import 'package:proyecto_1/core/widgets/3d/flutter_3d_viewer.dart';

class Product3DCard extends StatelessWidget {
  final String title;
  final String description;
  final String modelUrl;

  const Product3DCard({
    super.key,
    required this.title,
    required this.description,
    required this.modelUrl,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 6,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            child: Custom3DViewer(src: modelUrl),
          ),

          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 6),
                Text(
                  description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 12),

                // Botón de acción (opcional)
                ElevatedButton(
                  onPressed: () {
                    debugPrint("Producto seleccionado");
                  },
                  child: const Text("Ver más"),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
