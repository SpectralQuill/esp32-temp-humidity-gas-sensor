import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

export interface SensorReading {
  id: string;
  temperature: number;
  humidity: number;
  gas: number;
  createdAt: string;
}

class ApiService {
  private client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  async getReadings(limit = 100): Promise<SensorReading[]> {
    const response = await this.client.get(`/readings?limit=${limit}`);
    return response.data;
  }

  async getLatestReading(): Promise<SensorReading | null> {
    const response = await this.client.get('/readings/latest');
    return response.data;
  }

  async getStats() {
    const response = await this.client.get('/readings/stats');
    return response.data;
  }

  async createReading(data: Omit<SensorReading, 'id' | 'createdAt'>) {
    const response = await this.client.post('/readings', data);
    return response.data;
  }
}

export const api = new ApiService();
