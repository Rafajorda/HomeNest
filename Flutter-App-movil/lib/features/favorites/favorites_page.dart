import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/models/favorite.dart';
import '../../providers/cart_provider.dart';
import 'widgets/favorite_card.dart';

/// Página de favoritos
///
/// Muestra todos los productos marcados como favoritos del usuario con:
/// - Nombre del producto
/// - Precio
/// - Imagen
/// - Opción para eliminar de favoritos
class FavoritesPage extends ConsumerWidget {
  const FavoritesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoritesAsync = ref.watch(myFavoritesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Mis Favoritos')),
      body: favoritesAsync.when(
        data: (favorites) {
          if (favorites.isEmpty) {
            return _buildEmptyFavorites(context);
          }
          return _buildFavoritesList(ref, favorites);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => _buildError(context, error.toString()),
      ),
    );
  }

  /// Vista cuando no hay favoritos
  Widget _buildEmptyFavorites(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.favorite_outline,
            size: 100,
            color: Theme.of(context).colorScheme.onSurface.withAlpha(102),
          ),
          const SizedBox(height: 20),
          Text(
            'No tienes favoritos',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withAlpha(153),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Guarda tus productos favoritos',
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurface.withAlpha(128),
            ),
          ),
          const SizedBox(height: 30),
          ElevatedButton.icon(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.shopping_bag),
            label: const Text('Ir a comprar'),
          ),
        ],
      ),
    );
  }

  /// Lista de favoritos
  Widget _buildFavoritesList(WidgetRef ref, List<Favorite> favorites) {
    return RefreshIndicator(
      onRefresh: () async {

        ref.invalidate(myFavoritesProvider);
        await ref.read(myFavoritesProvider.future);
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: favorites.length,
        itemBuilder: (context, index) {
          return FavoriteCard(favorite: favorites[index]);
        },
      ),
    );
  }

  /// Vista de error
  Widget _buildError(BuildContext context, String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 80,
            color: Theme.of(context).colorScheme.error,
          ),
          const SizedBox(height: 20),
          Text(
            'Error al cargar favoritos',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 10),
          Text(
            error,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurface.withAlpha(153),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.arrow_back),
            label: const Text('Volver'),
          ),
        ],
      ),
    );
  }
}
