import 'package:flutter/material.dart';
import 'package:ar_flutter_plugin_updated/ar_flutter_plugin.dart';
import 'package:ar_flutter_plugin_updated/datatypes/config_planedetection.dart';
import 'package:ar_flutter_plugin_updated/managers/ar_location_manager.dart';
import 'package:ar_flutter_plugin_updated/managers/ar_session_manager.dart';
import 'package:ar_flutter_plugin_updated/managers/ar_object_manager.dart';
import 'package:ar_flutter_plugin_updated/managers/ar_anchor_manager.dart';
import 'package:ar_flutter_plugin_updated/datatypes/node_types.dart';
import 'package:ar_flutter_plugin_updated/models/ar_node.dart';
import 'package:ar_flutter_plugin_updated/models/ar_anchor.dart';
import 'package:ar_flutter_plugin_updated/models/ar_hittest_result.dart';
import 'package:vector_math/vector_math_64.dart' as vector;
import '../../core/services/model_3d_service.dart';

class ArViewPage extends StatefulWidget {
  final String? model3DPath; // Ahora es la ruta del backend (puede ser null)
  final String modelName;

  const ArViewPage({super.key, this.model3DPath, required this.modelName});

  @override
  State<ArViewPage> createState() => _ArViewPageState();
}

class _ArViewPageState extends State<ArViewPage> {
  ARSessionManager? arSessionManager;
  ARObjectManager? arObjectManager;
  ARAnchorManager? arAnchorManager;

  bool _modelPlaced = false;
  String? _localModelPath;
  String _statusMessage =
      '📱 Mueve el móvil LENTAMENTE apuntando a una superficie plana (mesa, suelo)';

  List<ARPlaneAnchor> anchors = []; // Mantener referencias a los anchors
  ARNode? _currentNode; // Nodo actual para modificar

  // Valores ajustables de posición y rotación
  double _positionX = 0.0;
  double _positionY = 0.0;
  double _positionZ = 0.0;
  double _rotationY = 0.0; // Rotación en el eje Y (horizontal)
  bool _showControls = false;

  @override
  void initState() {
    super.initState();
    _downloadAndPrepareModel();
  }

  Future<void> _downloadAndPrepareModel() async {
    try {
      debugPrint('[AR] 🔍 Iniciando preparación del modelo');

      if (widget.model3DPath == null || widget.model3DPath!.isEmpty) {
        debugPrint('[AR] ⚠️ No hay modelo 3D disponible para este producto');
        setState(() {
          _statusMessage = '⚠️ Este producto no tiene modelo 3D disponible';
        });
        return;
      }

      debugPrint('[AR] 📥 Descargando modelo desde: ${widget.model3DPath}');
      setState(() {
        _statusMessage = '📥 Descargando modelo 3D...';
      });

      final fileName = await Model3DService.downloadModel(widget.model3DPath);

      if (fileName == null) {
        debugPrint('[AR] ❌ Error al descargar el modelo');
        setState(() {
          _statusMessage = '❌ Error al descargar el modelo 3D';
        });
        return;
      }

      debugPrint('[AR] ✅ Modelo descargado: $fileName');
      setState(() {
        _localModelPath = fileName;
        _statusMessage =
            '👆 Mueve el móvil lentamente y toca una superficie plana';
      });
    } catch (e, stackTrace) {
      debugPrint('[AR] ❌ Error preparando modelo: $e');
      debugPrint('[AR] 📋 Stack trace: $stackTrace');
      setState(() {
        _statusMessage = '❌ Error preparando modelo: $e';
      });
    }
  }

  @override
  void dispose() {
    arSessionManager?.dispose();
    super.dispose();
  }

  void onARViewCreated(
    ARSessionManager sessionManager,
    ARObjectManager objectManager,
    ARAnchorManager anchorManager,
    ARLocationManager locationManager,
  ) {
    arSessionManager = sessionManager;
    arObjectManager = objectManager;
    arAnchorManager = anchorManager;

    arSessionManager!.onInitialize(
      showFeaturePoints: false, // Menos ruido visual
      showPlanes: true,
      customPlaneTexturePath: null,
      showWorldOrigin: false,
      handleTaps: true,
      handlePans: false,
      handleRotation: false, // Desactivar rotación manual
    );

    arObjectManager!.onInitialize();
    arSessionManager!.onPlaneOrPointTap = onPlaneOrPointTapped;

    // Dar tiempo para que ARCore se inicialice
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _statusMessage = '👆 Toca una superficie PLANA para colocar la radio';
        });
      }
    });
  }

  Future<void> onPlaneOrPointTapped(List<ARHitTestResult> hits) async {
    debugPrint('[AR] 🖱️ Tap detectado, hits: ${hits.length}');

    if (_modelPlaced) {
      debugPrint('[AR] ⚠️ Modelo ya colocado');
      setState(
        () => _statusMessage = '⚠️ Modelo ya colocado. Usa el botón Reset',
      );
      return;
    }

    if (_localModelPath == null) {
      debugPrint('[AR] ⏳ Esperando a que el modelo se copie...');
      setState(() => _statusMessage = '⏳ Preparando modelo...');
      return;
    }

    if (hits.isEmpty) {
      debugPrint('[AR] ❌ No hay superficies detectadas');
      setState(
        () => _statusMessage =
            '❌ Mueve el móvil lentamente sobre una superficie PLANA',
      );
      return;
    }

    // Superficie detectada, informar al usuario
    setState(() {
      _statusMessage = '⏳ Colocando modelo...';
    });

    var hit = hits.first;
    debugPrint('[AR] 📍 Intentando colocar modelo desde: $_localModelPath');

    try {
      // Crear anchor con la transformación exacta del hit
      var newAnchor = ARPlaneAnchor(
        transformation: hit.worldTransform,
        name: "radioAnchor",
      );
      bool? didAddAnchor = await arAnchorManager!.addAnchor(newAnchor);

      if (didAddAnchor == true) {
        debugPrint('[AR] ⚓ Anchor añadido exitosamente');
        anchors.add(newAnchor); // Guardar referencia

        var node = ARNode(
          type: NodeType.fileSystemAppFolderGLB,
          uri: _localModelPath!,
          scale: vector.Vector3(0.2, 0.2, 0.2), // Tamaño fijo para muebles
          position: vector.Vector3(_positionX, _positionY, _positionZ),
          rotation: vector.Vector4(1.0, 0.0, 0.0, 0.0), // Sin rotación inicial
        );

        debugPrint('[AR] 📦 Añadiendo nodo desde: $_localModelPath');
        bool? didAddNode = await arObjectManager!.addNode(
          node,
          planeAnchor: newAnchor,
        );

        if (didAddNode == true) {
          debugPrint('[AR] ✅ ¡Modelo colocado exitosamente!');
          setState(() {
            _modelPlaced = true;
            _currentNode = node; // Guardar referencia
            _showControls = true; // Mostrar controles
            _statusMessage =
                '✅ ¡${widget.modelName} colocado! Usa "Cerca/Lejos" para cambiar el tamaño';
          });
        } else {
          debugPrint('[AR] ❌ Error: addNode devolvió false');
          setState(
            () => _statusMessage = '❌ Error al añadir el modelo a la escena',
          );
        }
      } else {
        debugPrint('[AR] ❌ Error: addAnchor devolvió false');
        setState(() => _statusMessage = '❌ Error al crear el anchor');
      }
    } catch (e) {
      debugPrint('[AR] ❌ Excepción al colocar modelo: $e');
      setState(() => _statusMessage = '❌ Error: $e');
    }
  }

  void onResetPressed() {
    debugPrint('[AR] 🔄 Reset solicitado - cierra y reabre la vista AR');
    setState(() {
      _statusMessage = '⚠️ Cierra y vuelve a abrir para resetear';
    });
  }

  void _updateNodeTransform() {
    if (_currentNode != null) {
      // Actualizar posición directamente (sin afectar la rotación)
      _currentNode!.position = vector.Vector3(
        _positionX,
        _positionY,
        _positionZ,
      );

      // Actualizar rotación directamente (sin afectar la posición)
      // Rotación en eje Y usando matriz de rotación
      final rotationMatrix = vector.Matrix4.rotationY(_rotationY);
      _currentNode!.rotation = rotationMatrix.getRotation();

      debugPrint(
        '[AR] 🔧 Modelo actualizado - Pos: ($_positionX, $_positionY, $_positionZ), Rot Y: ${(_rotationY * 180 / 3.14159).toStringAsFixed(0)}°',
      );
    }
  }

  void _adjustRotation(double delta) {
    setState(() {
      // Sumar el delta
      _rotationY += delta;

      // Normalizar para mantener entre 0 y 2π (0° y 360°)
      // Esto maneja correctamente tanto valores positivos como negativos
      while (_rotationY < 0) {
        _rotationY += 2 * 3.14159;
      }
      while (_rotationY >= 2 * 3.14159) {
        _rotationY -= 2 * 3.14159;
      }

      _updateNodeTransform();
    });
  }

  void _adjustPosition(String axis, double delta) {
    setState(() {
      switch (axis) {
        case 'X':
          _positionX = (_positionX + delta).clamp(-10.0, 10.0); // Ampliado
          break;
        case 'Y':
          _positionY = (_positionY + delta).clamp(-5.0, 5.0); // Ampliado
          break;
        case 'Z':
          // Mayor rango en Z para permitir más distancia (perspectiva más notable)
          _positionZ = (_positionZ + delta).clamp(-10.0, 10.0); // Ampliado
          break;
      }
      _updateNodeTransform();
    });
  }

  void _resetTransform() {
    setState(() {
      _positionX = 0.0;
      _positionY = 0.0;
      _positionZ = 0.0;
      _rotationY = 0.0;
      _updateNodeTransform();
      _statusMessage = '♻️ Posición y rotación restablecidas';
    });

    // Volver al mensaje original después de 2 segundos
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _statusMessage =
              '✅ ¡${widget.modelName} colocado! Usa "Cerca/Lejos" para cambiar el tamaño';
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('AR - ${widget.modelName}'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Stack(
        children: [
          ARView(
            onARViewCreated: onARViewCreated,
            planeDetectionConfig: PlaneDetectionConfig
                .horizontal, // Solo horizontal es más rápido
          ),
          Positioned(
            top: 20,
            left: 20,
            right: 20,
            child: Card(
              color: _modelPlaced
                  ? Colors.green.withValues(alpha: 0.9)
                  : Colors.blue.withValues(alpha: 0.9),
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Text(
                  _statusMessage,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
          if (_modelPlaced)
            Positioned(
              bottom: 20,
              left: 0,
              right: 0,
              child: Center(
                child: ElevatedButton.icon(
                  onPressed: () {
                    setState(() {
                      _showControls = !_showControls;
                    });
                  },
                  icon: Icon(_showControls ? Icons.expand_more : Icons.tune),
                  label: Text(
                    _showControls ? 'Ocultar Controles' : 'Ajustar Posición',
                  ),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                  ),
                ),
              ),
            ),
          if (_showControls)
            Positioned(
              bottom: 80,
              left: 10,
              right: 10,
              child: Card(
                color: Colors.black.withValues(alpha: 0.8),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Control de Posición X (Izquierda/Derecha)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            '↔️ Izq/Der',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Row(
                            children: [
                              IconButton(
                                onPressed: () => _adjustPosition('X', -0.1),
                                icon: const Icon(
                                  Icons.arrow_back,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                _positionX.toStringAsFixed(2),
                                style: const TextStyle(color: Colors.white),
                              ),
                              IconButton(
                                onPressed: () => _adjustPosition('X', 0.1),
                                icon: const Icon(
                                  Icons.arrow_forward,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      // Control de Posición Y (Arriba/Abajo)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            '↕️ Arriba/Abajo',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Row(
                            children: [
                              IconButton(
                                onPressed: () => _adjustPosition('Y', -0.1),
                                icon: const Icon(
                                  Icons.arrow_downward,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                _positionY.toStringAsFixed(2),
                                style: const TextStyle(color: Colors.white),
                              ),
                              IconButton(
                                onPressed: () => _adjustPosition('Y', 0.1),
                                icon: const Icon(
                                  Icons.arrow_upward,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      // Control de Posición Z (Adelante/Atrás)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            '⬆️ Cerca/Lejos',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Row(
                            children: [
                              IconButton(
                                onPressed: () => _adjustPosition(
                                  'Z',
                                  -0.2,
                                ), // Incremento mayor
                                icon: const Icon(
                                  Icons.remove,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                _positionZ.toStringAsFixed(2),
                                style: const TextStyle(color: Colors.white),
                              ),
                              IconButton(
                                onPressed: () => _adjustPosition(
                                  'Z',
                                  0.2,
                                ), // Incremento mayor
                                icon: const Icon(
                                  Icons.add,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const Divider(color: Colors.white24),
                      // Control de Rotación (Horizontal)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            '🔄 Rotar (15°)',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Row(
                            children: [
                              IconButton(
                                onPressed: () => _adjustRotation(
                                  -0.2618,
                                ), // -15° en radianes
                                icon: const Icon(
                                  Icons.rotate_left,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                '${(_rotationY * 180 / 3.14159).toStringAsFixed(0)}°',
                                style: const TextStyle(color: Colors.white),
                              ),
                              IconButton(
                                onPressed: () =>
                                    _adjustRotation(0.2618), // +15° en radianes
                                icon: const Icon(
                                  Icons.rotate_right,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const Divider(color: Colors.white24),
                      // Botón de Reset
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _resetTransform,
                          icon: const Icon(Icons.restart_alt),
                          label: const Text('Restablecer Posición y Rotación'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
