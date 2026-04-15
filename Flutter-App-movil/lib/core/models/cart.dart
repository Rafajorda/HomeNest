import 'product.dart';

/// Modelo de Cart Product (producto dentro del carrito)
class CartProductModel {
  final int id;
  final Product product;
  final int quantity;

  CartProductModel({
    required this.id,
    required this.product,
    required this.quantity,
  });

  factory CartProductModel.fromJson(Map<String, dynamic> json) {
    return CartProductModel(
      id: json['id'] as int,
      product: Product.fromJson(json['product'] as Map<String, dynamic>),
      quantity: json['quantity'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toJson() => {'id': id, 'quantity': quantity};

  /// Total del item (precio del producto x cantidad)
  double get total => product.price * quantity;

  /// Crea una copia con valores actualizados
  CartProductModel copyWith({int? id, Product? product, int? quantity}) {
    return CartProductModel(
      id: id ?? this.id,
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
    );
  }
}

/// Modelo del Carrito completo
class CartModel {
  final int id;
  final List<CartProductModel> cartProducts;
  final double total;
  final String status;

  CartModel({
    required this.id,
    required this.cartProducts,
    required this.total,
    required this.status,
  });

  factory CartModel.fromJson(Map<String, dynamic> json) {
    final productsJson = json['cartProducts'] as List<dynamic>? ?? [];

    return CartModel(
      id: json['id'] as int,
      cartProducts: productsJson
          .map(
            (item) => CartProductModel.fromJson(item as Map<String, dynamic>),
          )
          .toList(),
      total: (json['total'] ?? 0).toDouble(),
      status: json['status'] as String? ?? 'active',
    );
  }

  Map<String, dynamic> toJson() => {'id': id};

  /// Número total de items en el carrito
  int get itemCount => cartProducts.fold(0, (sum, item) => sum + item.quantity);

  /// Verifica si el carrito está vacío
  bool get isEmpty => cartProducts.isEmpty;

  /// Verifica si el carrito NO está vacío
  bool get isNotEmpty => cartProducts.isNotEmpty;

  /// Busca un producto en el carrito por su ID
  CartProductModel? findProductById(String productId) {
    try {
      return cartProducts.firstWhere((item) => item.product.id == productId);
    } catch (e) {
      return null;
    }
  }

  /// Verifica si un producto está en el carrito
  bool containsProduct(String productId) {
    return cartProducts.any((item) => item.product.id == productId);
  }

  /// Crea una copia con valores actualizados
  CartModel copyWith({
    int? id,
    List<CartProductModel>? cartProducts,
    double? total,
    String? status,
  }) {
    return CartModel(
      id: id ?? this.id,
      cartProducts: cartProducts ?? this.cartProducts,
      total: total ?? this.total,
      status: status ?? this.status,
    );
  }

  /// Carrito vacío por defecto
  static CartModel empty() {
    return CartModel(id: 0, cartProducts: [], total: 0.0, status: 'active');
  }
}
