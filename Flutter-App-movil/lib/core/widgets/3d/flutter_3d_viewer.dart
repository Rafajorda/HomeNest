import 'package:flutter/material.dart';
import 'package:flutter_3d_controller/flutter_3d_controller.dart';

class Custom3DViewer extends StatelessWidget {
  final String src;

  const Custom3DViewer({super.key, required this.src});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: SizedBox(
        height: 300,
        width: double.infinity,
        child: Flutter3DViewer(
          src: src,
          activeGestureInterceptor: true,
          enableTouch: true,
          progressBarColor: Colors.orange,
          onProgress: (double progressValue) {
            debugPrint('model loading progress : $progressValue');
          },
          onLoad: (String modelAddress) {
            debugPrint('model loaded : $modelAddress');
          },
          onError: (String error) {
            debugPrint('model failed to load : $error');
          },
        ),
      ),
    );
  }
}
