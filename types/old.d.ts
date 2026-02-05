interface SensorReadingOld {
    id: string;
    value: number;
    createdAt: Date;
    updatedAt: Date;
}

type TemperatureCReading = SensorReadingOld;

type HumidityReading = SensorReadingOld;

type GasReading = SensorReadingOld;

interface PaginationParams {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
}

interface AllReadings {
    temperatureC?: TemperatureCReading;
    humidity?: HumidityReading;
    gas?: GasReading;
    timestamp?: Date;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

interface ApiConfig {
  baseURL: string;
  apiKey?: string;
}
