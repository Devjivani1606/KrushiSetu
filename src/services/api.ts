import { API_CONFIG } from '../config/api.config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface SoilData {
  id: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  created_at: string;
}

export interface ApiResponse {
  success: boolean;
  data: SoilData;
  meta?: {
    currentIndex: number;
    totalRecords: number;
    intervalMinutes: number;
  };
}

export const fetchCurrentSoilData = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/current`);
  if (!response.ok) {
    throw new Error('Failed to fetch soil data');
  }
  return response.json();
};
