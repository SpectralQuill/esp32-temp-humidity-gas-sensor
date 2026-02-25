export const SAFETY_LEVELS_SEED_DATA: ReadonlyArray<SafetyLevel> = [

    /* ================= TEMPERATURE ================= */
    { readingType: "temperatureC", label: "Extreme Cold", threshold: 0, color: "1e90ff", level: "Warning" },
    { readingType: "temperatureC", label: "Cold", threshold: 10, color: "4169e1", level: "Warning" },
    { readingType: "temperatureC", label: "Cool", threshold: 18, color: "6495ed", level: "Good" },
    { readingType: "temperatureC", label: "Warm", threshold: 26, color: "4caf50", level: "Good" },
    { readingType: "temperatureC", label: "Hot", threshold: 32, color: "ff9800", level: "Warning" },
    { readingType: "temperatureC", label: "Very Hot", threshold: 38, color: "ff4444", level: "Danger" },
    { readingType: "temperatureC", label: "Extreme Heat", threshold: 42, color: "8b0000", level: "Danger" },

    /* ================= HUMIDITY ================= */
    { readingType: "humidity", label: "Extremely Dry", threshold: 0, color: "8b0000", level: "Danger" },
    { readingType: "humidity", label: "Very Dry", threshold: 0.20, color: "ff4444", level: "Warning" },
    { readingType: "humidity", label: "Dry", threshold: 0.30, color: "ff9800", level: "Warning" },
    { readingType: "humidity", label: "Optimal (Lower)", threshold: 0.40, color: "4caf50", level: "Good" },
    { readingType: "humidity", label: "Optimal (Upper)", threshold: 0.60, color: "4caf50", level: "Good" },
    { readingType: "humidity", label: "Humid", threshold: 0.70, color: "ff4444", level: "Warning" },
    { readingType: "humidity", label: "Extremely Humid", threshold: 0.85, color: "8b0000", level: "Danger" },

    /* ================= GAS ================= */
    { readingType: "gas", label: "Clean", threshold: 0.00, color: "4caf50", level: "Good" },
    { readingType: "gas", label: "Trace", threshold: 0.10, color: "4caf50", level: "Good" },
    { readingType: "gas", label: "Elevated", threshold: 0.25, color: "ff9800", level: "Warning" },
    { readingType: "gas", label: "High", threshold: 0.40, color: "ff5722", level: "Warning" },
    { readingType: "gas", label: "Dangerous", threshold: 0.60, color: "8b0000", level: "Danger" },
    { readingType: "gas", label: "Critical", threshold: 0.80, color: "340000", level: "Danger" },

    /* ================= GENERAL ================= */
    { readingType: "general", label: "Unknown", threshold: -1, color: "a1a1a1", level: "Unknown" },
    { readingType: "general", label: "Good", threshold: 0, color: "4caf50", level: "Good" },
    { readingType: "general", label: "Warning", threshold: 1, color: "ff9800", level: "Warning" },
    { readingType: "general", label: "Danger", threshold: 2, color: "8b0000", level: "Danger" }
];
