/*  =========================
    DATABASE ROWS
    ========================= */

interface SensorReadingRow {
    createdAt: string;
    temperatureC: number;
    humidity: number;
    gas: number;
}

interface SensortReadingBucket {
    temperatureC: number;
    humidity: number;
    gas: number;
    readingsCount: number;
};

type SafetyLevelRow = SafetyLevel;

/*  =========================
    API DTO'S
    ========================= */

interface CreateReadingDto {
    createdAt?: string;
    temperatureC: number;
    humidity: number;
    gas: number;
}

interface DateRangeDto {
    startDate?: string;
    endDate?: string;
    excludeStartDate?: BooleanString;
    excludeEndDate?: BooleanString;
}

interface BucketedDateRangeDto extends DateRangeDto {
    bucketIntervalMs?: number;
    bucketOffsetDate?: Date;
}

interface GetSafetyLevelsDto {
    readingType: SafetyLevelReadingType
}

/*  =========================
    API RESPONSES
    ========================= */

interface ApiHealth {
    status: "healthy" | "unhealthy";
    service: string;
    timestamp: string;
    database: string;
    databaseStatus: "reachable" | "unreachable";
    uptime: number;
    sampleReadingExists: boolean
}

interface MessageResponse {
    message: string;
}
