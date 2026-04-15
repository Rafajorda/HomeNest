import 'package:flutter/material.dart';
import 'package:proyecto_1/core/widgets/button.dart';
import 'package:proyecto_1/core/widgets/dropdown.dart';
import 'package:proyecto_1/core/widgets/general_chip.dart';
import 'package:proyecto_1/core/widgets/toggle.dart';
import 'package:proyecto_1/core/widgets/loading_indicator.dart';
import 'package:proyecto_1/core/utils/snackbar.dart';
import 'package:proyecto_1/core/widgets/error_view.dart';
import 'package:proyecto_1/core/widgets/empty_state.dart';
import 'package:proyecto_1/core/widgets/color_chip.dart';
import 'package:proyecto_1/core/models/color.dart';
import 'package:proyecto_1/features/ar/ar_view_page.dart';

/// Página de catálogo que muestra todos los widgets generales disponibles.
///
/// Esta página sirve como documentación viva de los componentes reutilizables
/// y permite visualizar su comportamiento y apariencia.
class GeneralWidgetsCatalogPage extends StatefulWidget {
  const GeneralWidgetsCatalogPage({super.key});

  @override
  State<GeneralWidgetsCatalogPage> createState() =>
      _GeneralWidgetsCatalogPageState();
}

class _GeneralWidgetsCatalogPageState extends State<GeneralWidgetsCatalogPage> {
  // ========== ESTADO DE WIDGETS INTERACTIVOS ==========

  /// Estado del switch de notificaciones (GeneralToggle)
  /// Se actualiza cuando el usuario cambia el interruptor
  bool switchValue = false;

  /// Opción seleccionada en el dropdown (GeneralDropdown)
  /// Valores posibles: 'Op 1', 'Op 2', 'Op 3'
  String selectedOption = 'Op 1';

  /// Índice del chip seleccionado (GeneralChip)
  /// -1 indica que no hay ningún chip seleccionado
  int selectedChip = 0;

  /// ID del color seleccionado (ColorChipWithCircle)
  /// Corresponde al id de ColorModel
  String selectedColorId = '1';

  /// Lista de colores de ejemplo para demostrar ColorChipWithCircle
  ///
  /// Cada ColorModel contiene:
  /// - id: identificador único
  /// - name: nombre del color (ej: "Rojo")
  /// - hexCode: código hexadecimal del color (ej: "#FF0000")
  final List<ColorModel> exampleColors = [
    ColorModel(id: '1', name: 'Rojo', hexCode: '#FF0000'),
    ColorModel(id: '2', name: 'Azul', hexCode: '#0000FF'),
    ColorModel(id: '3', name: 'Verde', hexCode: '#00FF00'),
    ColorModel(id: '4', name: 'Amarillo', hexCode: '#FFFF00'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Catálogo Widgets Generales')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            // ========== WIDGETS ORIGINALES ==========
            // Estos son los widgets base del sistema de diseño

            // 🔹 GENERAL TOGGLE
            // Widget de interruptor (switch) con título, subtítulo e icono
            // Útil para configuraciones booleanas (activar/desactivar)
            _buildSectionTitle('🧩 GeneralToggle'),
            GeneralToggle(
              title: 'Activar notificaciones',
              subtitle: 'Ejemplo de interruptor general',
              icon: Icons.notifications,
              value: switchValue,
              onChanged: (value) {
                setState(() {
                  switchValue = value;
                });
              },
            ),
            const Divider(height: 32),

            // 🔹 GENERAL DROPDOWN
            // Widget de lista desplegable con título e icono
            // Permite seleccionar una opción de múltiples valores
            _buildSectionTitle('📋 GeneralDropdown'),
            GeneralDropdown<String>(
              title: 'Selecciona una opción',
              value: selectedOption,
              icon: Icons.arrow_drop_down,
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    selectedOption = value;
                  });
                }
              },
              items: const [
                DropdownMenuItem(value: 'Op 1', child: Text('Op 1')),
                DropdownMenuItem(value: 'Op 2', child: Text('Op 2')),
                DropdownMenuItem(value: 'Op 3', child: Text('Op 3')),
              ],
            ),
            const Divider(height: 32),

            // 🔹 GENERAL CHIP
            // Chips seleccionables para filtros o categorías
            // Solo uno puede estar seleccionado a la vez en este ejemplo
            _buildSectionTitle('🏷️ GeneralChip'),
            Wrap(
              spacing: 8,
              children: List.generate(3, (index) {
                return GeneralChip(
                  label: 'Chip ${index + 1}',
                  isSelected: selectedChip == index,
                  onSelected: () {
                    setState(() {
                      // Toggle: si se clickea el mismo chip, se deselecciona
                      selectedChip = selectedChip == index ? -1 : index;
                    });
                  },
                );
              }),
            ),
            const Divider(height: 32),

            // 🔹 GENERAL BUTTON
            // Botón principal con label y callback
            // Muestra un SnackBar de éxito al presionarse
            _buildSectionTitle('🔘 GeneralButton'),
            GeneralButton(
              label: 'Botón de ejemplo',
              onPressed: () {
                GeneralSnackBar.success(context, '¡Botón presionado!');
              },
            ),
            const Divider(height: 32),

            // ========== NUEVOS WIDGETS ==========
            // Widgets de feedback y estados de UI

            // 🔹 GENERAL LOADING INDICATOR
            // Indicador de carga con tamaño y mensaje personalizables
            // Puede mostrarse inline o en pantalla completa (overlay)
            _buildSectionTitle('⏳ GeneralLoadingIndicator'),
            const Text(
              'Inline (siempre visible en catálogo):',
              style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
            ),
            const SizedBox(height: 8),
            const GeneralLoadingIndicator(
              size: 30,
              message: 'Cargando datos...',
            ),
            const SizedBox(height: 16),
            GeneralButton(
              label: 'Ver Loading Pantalla Completa',
              icon: Icons.hourglass_empty,
              onPressed: () {
                // Demostración: mostrar loading overlay por 2 segundos
                // barrierDismissible: false evita cerrar tocando fuera
                showDialog(
                  context: context,
                  barrierDismissible: false,
                  builder: (_) => const GeneralLoadingIndicator(
                    fullScreen: true,
                    size: 50,
                    message: 'Procesando...',
                  ),
                );
                // Cerrar automáticamente después de 2 segundos
                Future.delayed(const Duration(seconds: 2), () {
                  // ignore: use_build_context_synchronously
                  Navigator.of(context).pop();
                });
              },
            ),
            const Divider(height: 32),

            // 🔹 GENERAL SNACKBAR
            // Notificaciones toast en la parte inferior de la pantalla
            // 4 variantes: success, error, info, warning
            _buildSectionTitle('💬 GeneralSnackBar'),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                // SnackBar de éxito (verde)
                ElevatedButton.icon(
                  onPressed: () =>
                      GeneralSnackBar.success(context, '¡Operación exitosa!'),
                  icon: const Icon(Icons.check_circle),
                  label: const Text('Éxito'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Theme.of(context).colorScheme.onPrimary,
                  ),
                ),
                // SnackBar de error (rojo)
                ElevatedButton.icon(
                  onPressed: () =>
                      GeneralSnackBar.error(context, 'Error al procesar'),
                  icon: const Icon(Icons.error),
                  label: const Text('Error'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.error,
                    foregroundColor: Theme.of(context).colorScheme.onError,
                  ),
                ),
                // SnackBar de información (azul)
                ElevatedButton.icon(
                  onPressed: () =>
                      GeneralSnackBar.info(context, 'Información importante'),
                  icon: const Icon(Icons.info),
                  label: const Text('Info'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.secondary,
                    foregroundColor: Theme.of(context).colorScheme.onSecondary,
                  ),
                ),
                // SnackBar de advertencia (naranja)
                ElevatedButton.icon(
                  onPressed: () =>
                      GeneralSnackBar.warning(context, 'Advertencia detectada'),
                  icon: const Icon(Icons.warning),
                  label: const Text('Warning'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.tertiary,
                    foregroundColor: Theme.of(context).colorScheme.onTertiary,
                  ),
                ),
              ],
            ),
            const Divider(height: 32),

            // 🔹 GENERAL ERROR VIEW
            // Vista de error con icono, mensaje y botón de reintentar
            // Útil cuando falla la carga de datos de una sección
            _buildSectionTitle('❌ GeneralErrorView'),
            Container(
              height: 300,
              decoration: BoxDecoration(
                border: Border.all(
                  color: Theme.of(context).colorScheme.outline,
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: GeneralErrorView(
                message: 'No se pudieron cargar los datos',
                onRetry: () {
                  GeneralSnackBar.info(context, 'Reintentando...');
                },
              ),
            ),
            const Divider(height: 32),

            // 🔹 GENERAL EMPTY STATE
            // Vista cuando una lista/colección está vacía
            // Incluye icono, título, subtítulo y botón de acción opcional
            _buildSectionTitle('📭 GeneralEmptyState'),
            Container(
              height: 300,
              decoration: BoxDecoration(
                border: Border.all(
                  color: Theme.of(context).colorScheme.outline,
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: SingleChildScrollView(
                child: SizedBox(
                  height: 300,
                  child: GeneralEmptyState(
                    icon: Icons.favorite_border,
                    iconSize: 64, // Reducido de 80 a 64
                    title: 'No tienes favoritos',
                    subtitle: 'Añade productos a tu lista de favoritos',
                    actionLabel: 'Explorar productos',
                    onAction: () {
                      GeneralSnackBar.info(context, 'Navegando a productos...');
                    },
                  ),
                ),
              ),
            ),
            const Divider(height: 32),

            // 🔹 COLOR CHIP WITH CIRCLE
            // Chips de color con círculo visual del color
            // Útil para mostrar variantes de color de productos
            _buildSectionTitle('🎨 ColorChipWithCircle'),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: exampleColors.map((color) {
                return ColorChipWithCircle(
                  colorModel: color,
                  isSelected: selectedColorId == color.id,
                  onSelected: () {
                    setState(() {
                      selectedColorId = color.id;
                    });
                  },
                  showLabel: true, // Mostrar nombre del color
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            // Mostrar color actualmente seleccionado
            Text(
              'Color seleccionado: ${exampleColors.firstWhere((c) => c.id == selectedColorId).name}',
              style: const TextStyle(fontStyle: FontStyle.italic),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          try {
            await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const ArViewPage(
                  model3DPath: null, // Sin modelo, solo para prueba
                  modelName: 'Radio Retro',
                ),
              ),
            );
          } catch (e) {
            if (context.mounted) {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Row(
                    children: [
                      Icon(Icons.error_outline, color: Colors.orange),
                      SizedBox(width: 8),
                      Text('ARCore Requerido'),
                    ],
                  ),
                  content: const SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Para usar Realidad Aumentada necesitas tener instalado Google Play Services for AR (ARCore).',
                          style: TextStyle(fontSize: 14),
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Pasos para instalar:',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text('1. Abre Google Play Store'),
                        Text('2. Busca "Google Play Services for AR"'),
                        Text('3. Toca "Instalar"'),
                        Text(
                          '4. Espera a que se descargue (puede tardar 1-2 minutos)',
                        ),
                        Text('5. Vuelve a esta app y prueba de nuevo'),
                      ],
                    ),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('CERRAR'),
                    ),
                  ],
                ),
              );
            }
          }
        },
        icon: const Icon(Icons.view_in_ar),
        label: const Text('Ver Radio en AR'),
        tooltip: 'Realidad Aumentada',
      ),
    );
  }

  /// Construye un título de sección consistente
  ///
  /// Parámetros:
  /// - [title]: Texto del título con emoji opcional
  ///
  /// Retorna un Text widget con estilo bold y padding inferior
  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        title,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
    );
  }
}
