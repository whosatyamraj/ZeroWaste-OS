import axios from 'axios';
import logger from '../utils/logger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

class AIProxyService {
  private async callAI<T>(endpoint: string, data: unknown): Promise<T> {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}${endpoint}`, data, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error: any) {
      logger.error(`AI service call failed [${endpoint}]:`, error.message);
      if (error.response) {
        throw new Error(error.response.data?.detail || 'AI service returned an error');
      }
      throw new Error('AI service is currently unavailable');
    }
  }

  async getDemandForecast(data: {
    business_id: string;
    historical_data: Array<{ date: string; customers: number; orders: number; revenue: number }>;
    forecast_days: number;
  }) {
    return this.callAI('/api/ai/demand-forecast', data);
  }

  async analyzeFoodSafety(data: {
    image_base64?: string;
    image_url?: string;
    food_type: string;
    preparation_time: string;
    storage_conditions?: string;
  }) {
    return this.callAI('/api/ai/food-safety', data);
  }

  async getDecisionRecommendation(data: {
    food_name: string;
    food_type: string;
    quantity: number;
    unit: string;
    freshness_score: number;
    hours_until_expiry: number;
    nearby_ngo_count: number;
    nearby_demand_score: number;
    historical_acceptance_rate: number;
  }) {
    return this.callAI('/api/ai/decide-action', data);
  }

  async getInsights(data: {
    business_id: string;
    date_range: { start: string; end: string };
    waste_data: Array<{ food_type: string; quantity: number; reason: string; date: string }>;
  }) {
    return this.callAI('/api/ai/insights', data);
  }

  async getInventoryPredictions(data: {
    inventory_items: Array<{
      name: string;
      current_stock: number;
      daily_usage: number;
      lead_time_days: number;
    }>;
  }) {
    return this.callAI('/api/ai/inventory-predict', data);
  }
}

export default new AIProxyService();
