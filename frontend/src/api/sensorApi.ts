import { apiClient } from './client';

export const sensorApi = {
  // Temperature endpoints
  temperature: {
    getAll: (params?: PaginationParams) =>
      apiClient.get<ApiResponse<TemperatureCReading[]>>('/api/temperature', { params }),
    
    getLatest: () =>
      apiClient.get<ApiResponse<TemperatureCReading>>('/api/temperature/latest'),
    
    create: (value: number) =>
      apiClient.post<ApiResponse<TemperatureCReading>>('/api/temperature', { value }),
  },

  // Humidity endpoints
  humidity: {
    getAll: (params?: PaginationParams) =>
      apiClient.get<ApiResponse<HumidityReading[]>>('/api/humidity', { params }),
    
    getLatest: () =>
      apiClient.get<ApiResponse<HumidityReading>>('/api/humidity/latest'),
    
    create: (value: number) =>
      apiClient.post<ApiResponse<HumidityReading>>('/api/humidity', { value }),
  },

  // Gas endpoints
  gas: {
    getAll: (params?: PaginationParams) =>
      apiClient.get<ApiResponse<GasReading[]>>('/api/gas', { params }),
    
    getLatest: () =>
      apiClient.get<ApiResponse<GasReading>>('/api/gas/latest'),
    
    create: (value: number) =>
      apiClient.post<ApiResponse<GasReading>>('/api/gas', { value }),
  },

  // Combined endpoints
  readings: {
    getAllLatest: () =>
      apiClient.get<ApiResponse<AllReadings>>('/api/readings/latest'),
    
    getAll: (
      limit?: number,
      offset?: number,
      startDate?: Date,
      endDate?: Date
    ) =>
      apiClient.get<ApiResponse<any[]>>(
        '/api/readings/all',
        { params: { limit, offset, startDate, endDate }
      }),
    
    createAll: (data: { temperature?: number; humidity?: number; gas?: number }) =>
      apiClient.post<ApiResponse<any>>('/api/readings', data),
  },

  // System endpoints
  system: {
    getHealth: () =>
      apiClient.get<ApiResponse<any>>('/health'),
    
    getInfo: () =>
      apiClient.get<ApiResponse<any>>('/api')
  },
};
