type SensorReadingType = "temperatureC" | "humidity" | "gas";

// Initial for backend

interface Esp32Data {
    temperatureC?: number;
    humidity?: number;
    gas?: number;
    raw?: string;
    timestamp?: Date;
}

interface SensorReading {
    createdAt: Date;
    readingType: SensorReadingType;
    value: number;
}

interface DBSensorReading {
    createdAt: string; // ISO string
    readingType: SensorReadingType;
    value: number;
}

interface BatchSensorReadingsResult {
    createdAt: Date;
    temperatureC?: SensorReading;
    humidity?: SensorReading;
    gas?: SensorReading;
}

// Final for backend

interface LatestSensorReadings {
    temperatureC?: SensorReading;
    humidity?: SensorReading;
    gas?: SensorReading;
}

// Sensor Chart

interface SensorChartDataPoint {
    timestamp: number;
    temperatureC: number | null;
    humidity: number | null;
    gas: number | null;
}

type SensorChartData = SensorChartDataPoint[];
