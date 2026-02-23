import 'product.dart';

/// Modelo de Order Line (línea de pedido con un producto)
class OrderLineModel {
  final int id;
  final Product product;
  final int quantity;
  final double price;

  OrderLineModel({
    required this.id,
    required this.product,
    required this.quantity,
    required this.price,
  });

  factory OrderLineModel.fromJson(Map<String, dynamic> json) {
    return OrderLineModel(
      id: json['id'] as int,
      product: Product.fromJson(json['product'] as Map<String, dynamic>),
      quantity: json['quantity'] as int? ?? 1,
      price: (json['price'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {'id': id};

  /// Total del item (precio x cantidad)
  double get total => price * quantity;

  /// Crea una copia con valores actualizados
  OrderLineModel copyWith({
    int? id,
    Product? product,
    int? quantity,
    double? price,
  }) {
    return OrderLineModel(
      id: id ?? this.id,
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
      price: price ?? this.price,
    );
  }
}

/// Modelo de Order (pedido/venta completo)
class OrderModel {
  final int id;
  final List<OrderLineModel> orderLines;
  final double total;
  final String status;
  final DateTime createdAt;
  final DateTime? updatedAt;

  OrderModel({
    required this.id,
    required this.orderLines,
    required this.total,
    required this.status,
    required this.createdAt,
    this.updatedAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final linesJson = json['orderLines'] as List<dynamic>? ?? [];

    return OrderModel(
      id: json['id'] as int,
      orderLines: linesJson
          .map((item) => OrderLineModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      total: (json['total'] ?? 0).toDouble(),
      status: json['status'] as String? ?? 'pending',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,

    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt?.toIso8601String(),
  };

  /// Número total de items en el pedido
  int get itemCount => orderLines.fold(0, (sum, line) => sum + line.quantity);

  /// Verifica si el pedido está pendiente
  bool get isPending => status == 'pending';

  /// Verifica si el pedido está completado
  bool get isCompleted => status == 'completed';

  /// Verifica si el pedido está cancelado
  bool get isCancelled => status == 'cancelled';

  /// Color según el estado del pedido
  String get statusColor {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'grey';
    }
  }

  /// Texto legible del estado
  String get statusText {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      case 'processing':
        return 'Procesando';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      default:
        return status;
    }
  }

  /// Crea una copia con valores actualizados
  OrderModel copyWith({
    int? id,
    List<OrderLineModel>? orderLines,
    double? total,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return OrderModel(
      id: id ?? this.id,
      orderLines: orderLines ?? this.orderLines,
      total: total ?? this.total,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
