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
