import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import type { MarketplaceQuery, MarketplaceResponse } from '../types';

export function useMarketplace(query: MarketplaceQuery) {
  return useQuery({
    queryKey: ['marketplace', query],
    queryFn: async (): Promise<MarketplaceResponse> => {
      const { data } = await apiClient.get('/marketplace', { params: query });
      return data.data;
    },
  });
}
