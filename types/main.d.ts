type SensorReadingType = "temperature_c" | "humidity" | "gas";

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

interface Esp32Data {
    temperature_c?: number;
    humidity?: number;
    gas?: number;
    raw?: string;
    timestamp?: Date;
}
