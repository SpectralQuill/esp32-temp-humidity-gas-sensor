/* =======================
GENERAL TYPES
======================= */

type BooleanString = "true" | "false";
type SensorReadingType = "temperatureC" | "humidity" | "gas";

/* =======================
ESP32 API
======================= */

interface Esp32ApiHealth {
    status: "healthy" | "unhealthy";
    service: string;
    timestamp: string;
    database: string;
    databaseStatus: "reachable" | "unreachable";
    uptime: number;
    sampleReadingExists: boolean;
}

/* =======================
SENSOR READINGS
======================= */

interface SensorReading {
    createdAt: Date;
    temperatureC: number;
    humidity: number;
    gas: number;
}

interface SensorReadingRow {
    createdAt: string;
    temperatureC: number;
    humidity: number;
    gas: number;
}

interface SensorReadingChartPoint {
    timestamp: number;
    temperatureC: number;
    humidity: number;
    gas: number;
}

/* =======================
API DTOs
======================= */

interface CreateReadingDto {
    createdAt?: string;
    temperatureC: number;
    humidity: number;
    gas: number;
}

interface GetReadingsDto {
    startDate?: string;
    endDate?: string;
    excludeStartDate?: BooleanString;
    excludeEndDate?: BooleanString;
}

interface DeleteReadingsDto {
    startDate?: string;
    endDate?: string;
    excludeStartDate?: BooleanString;
    excludeEndDate?: BooleanString;
}

interface MessageResponse {
    message: string;
}
