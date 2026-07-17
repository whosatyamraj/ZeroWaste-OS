import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import type { InventoryQuery, InventoryResponse } from '../types';

export function useInventory(query: InventoryQuery) {
  return useQuery({
    queryKey: ['inventory', query],
    queryFn: async (): Promise<InventoryResponse> => {
      // In a real app, you'd fetch from an FBO specific endpoint like /food-items/my-inventory
      const { data } = await apiClient.get('/food-items', { params: query });
      return data.data;
    },
  });
}
