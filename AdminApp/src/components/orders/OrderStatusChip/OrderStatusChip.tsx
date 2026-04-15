/**
 * Componente OrderStatusChip
 * 
 * Chip reutilizable para mostrar el estado de un pedido
 * con colores y textos consistentes según el tema
 */

import React from 'react';
import { Chip, useTheme } from 'react-native-paper';
import { getOrderStatusConfig } from '../../../utils/orderStatus';
import { styles } from './OrderStatusChip.styles';

interface OrderStatusChipProps {
  status: string;
  compact?: boolean;
}

/**
 * Chip de estado de pedido
 * 
 * @param status - Estado del pedido ('pending', 'processing', 'shipped', 'completed', 'cancelled')
 * @param compact - Si debe ser compacto (menor altura)
 */
export const OrderStatusChip = ({ status, compact = true }: OrderStatusChipProps) => {
  const theme = useTheme();
  const config = getOrderStatusConfig(status, theme);

  return (
    <Chip
      mode="flat"
      compact={compact}
      style={[
        styles.chip,
        { backgroundColor: config.backgroundColor },
      ]}
      textStyle={[
        styles.chipText,
        { color: config.textColor },
      ]}
    >
      {config.text}
    </Chip>
  );
};
