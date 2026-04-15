/**
 * Componente ProductListHeader
 * 
 * Buscador y contador de productos
 */

import React from 'react';
import { View } from 'react-native';
import { Searchbar, Text, useTheme } from 'react-native-paper';
import { getStyles } from './ProductListHeader.styles';

interface ProductListHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
}

export const ProductListHeader = ({ 
  searchQuery, 
  onSearchChange, 
  totalCount 
}: ProductListHeaderProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  
  return (
    <View style={styles.header}>
      <Searchbar
        placeholder="Buscar productos..."
        value={searchQuery}
        onChangeText={onSearchChange}
        style={styles.searchBar}
      />
      <Text variant="bodyMedium" style={styles.count}>
        Total: {totalCount} producto{totalCount !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};
