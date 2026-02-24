interface Esp32Data {
    temperatureC?: number;
    humidity?: number;
    gas?: number;
    raw?: string;
    timestamp?: Date;
}

interface SensorReadingOld {
    createdAt: Date;
    readingType: SensorReadingType;
    value: number;
}

interface DBSensorReadingOld {
    createdAt: string; // ISO string
    readingType: SensorReadingType;
    value: number;
}

interface BatchSensorReadingOldsResult {
    createdAt: Date;
    temperatureC?: SensorReadingOld;
    humidity?: SensorReadingOld;
    gas?: SensorReadingOld;
}

// was final for backend

interface LatestSensorReadingOlds {
    temperatureC?: SensorReadingOld;
    humidity?: SensorReadingOld;
    gas?: SensorReadingOld;
}

// Sensor Chart

interface SensorChartDataPoint {
    timestamp: number;
    temperatureC: number | null;
    humidity: number | null;
    gas: number | null;
}

type SensorChartData = SensorChartDataPoint[];
