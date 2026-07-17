export interface ForecastDataPoint {
  day: string;
  predictedDemand: number;
  actualDemand?: number;
  confidenceInterval: [number, number];
}

export interface AIForecastResponse {
  accuracy: number;
  forecast: ForecastDataPoint[];
  recommendations: string[];
}
