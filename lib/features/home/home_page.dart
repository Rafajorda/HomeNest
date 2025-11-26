import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:proyecto_1/core/models/product_filters.dart';
import 'package:proyecto_1/features/settings/settings_page.dart';
import 'package:proyecto_1/features/profile/profile_page.dart';
import 'home_state.dart';
import 'home_data_loader.dart';
import 'widgets/widgets.dart';

class MyHomePage extends ConsumerStatefulWidget {
  const MyHomePage({super.key});

  @override
  ConsumerState<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends ConsumerState<MyHomePage> {
  late HomeState _state;
  late HomeDataLoader _dataLoader;

  @override
  void initState() {
    super.initState();
    _state = HomeState();
    _dataLoader = HomeDataLoader(
      ref: ref,
      onStateUpdate: (newState) {
        if (mounted) {
          setState(() {
            _state = newState;
          });
        }
      },
    );
    _loadData();
  }

  @override
  void dispose() {
    _state.categoryService?.dispose();
    _state.colorService?.dispose();
    super.dispose();
  }

  Future<void> _loadData([ProductFilters? filters]) async {
    await _dataLoader.loadData(_state, filters);
  }

  Future<void> _openFiltersDialog() async {
    final result = await showDialog<ProductFilters>(
      context: context,
      builder: (context) =>
          ProductFiltersDialog(initialFilters: _state.currentFilters),
    );
    if (result != null) {
      await _loadData(result);
    }
  }

  void _onCategorySelected(dynamic category) {
    setState(() {
      if (category == null) {
        _state.clearCategorySelection();
      } else {
        _state.selectCategory(category);
      }
    });
    _loadData();
  }

  @override
  Widget build(BuildContext context) {
    if (_state.isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_state.errorMessage != null) {
      return HomeErrorView(
        errorMessage: _state.errorMessage!,
        onRetry: _loadData,
      );
    }
    return Scaffold(
      appBar: HomeAppBar(
        onSettingsTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SettingsPage()),
        ),
        onProfileTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ProfilePage()),
        ),
      ),
      body: Column(
        children: [
          const UserGreeting(),
          CategoryChipsList(
            categories: _state.categories,
            selectedCategoryId: _state.selectedCategoryId,
            onCategorySelected: _onCategorySelected,
          ),
          ActiveFiltersBar(
            currentFilters: _state.currentFilters,
            colors: _state.colors,
            onOpenFilters: _openFiltersDialog,
            onFiltersChanged: (newFilters) => _loadData(newFilters),
            onClearAll: () {
              setState(() {
                _state = _state.copyWith(currentFilters: ProductFilters.empty);
              });
              _loadData();
            },
          ),
          Expanded(
            child: ProductGrid(
              products: _state.filteredProducts,
              favoriteProductIds: _state.favoriteProductIds,
              onProductReturn: () => _loadData(_state.currentFilters),
            ),
          ),
        ],
      ),
    );
  }
}
