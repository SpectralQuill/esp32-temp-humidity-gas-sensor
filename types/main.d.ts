/*  =========================
    SENSOR READING
    ========================= */

interface SensorReading {
    createdAt: Date;
    temperatureC: number;
    humidity: number;
    gas: number;
}

type SensorReadingType = "temperatureC" | "humidity" | "gas";

/*  =========================
    SAFETY LEVELS
    ========================= */

type GeneralSafetyLevel = "Unknown" | "Good" | "Warning" | "Danger";

type SafetyLevelReadingType = SensorReadingType | "general";

interface SafetyLevel {
    readingType: SafetyLevelReadingType;
	label: string;
	threshold: number | null;
	color: string;
	level: GeneralSafetyLevel
}
