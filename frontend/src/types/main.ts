export interface SensorReading {
    id: string;
    value: number;
    createdAt: Date;
    updatedAt: Date;
}

export type TemperatureCReading = SensorReading;

export type HumidityReading = SensorReading;

export type GasReading = SensorReading;

export interface PaginationParams {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
}

export interface AllReadings {
    temperatureC?: TemperatureCReading;
    humidity?: HumidityReading;
    gas?: GasReading;
    timestamp?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiConfig {
  baseURL: string;
  apiKey?: string;
}
