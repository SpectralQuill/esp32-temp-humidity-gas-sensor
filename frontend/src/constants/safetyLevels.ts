export interface GeneralSafetyLevelProps {
    color: string,
    label: string,
    range: string[]
}

export interface SensorChartReferenceLineProps {
    color: string,
    label: string,
    y: number
}

export const TEMPERATURE_C_REFERENCE_LINES: SensorChartReferenceLineProps[] = [
    {color: "#1e90ff", label: "Extreme Cold", y: 0},
    {color: "#4169e1", label: "Cold", y: 10},
    {color: "#6495ed", label: "Cool", y: 18},
    {color: "#4caf50", label: "Warm", y: 26},
    {color: "#ff9800", label: "Hot", y: 32},
    {color: "#ff4444", label: "Very Hot", y: 38},
    {color: "#8b0000", label: "Extreme Heat", y: 42}
];
export const HUMIDITY_REFERENCE_LINES: SensorChartReferenceLineProps[] = [
    {color: "#8b0000", label: "Extremely Dry", y: 0},
    {color: "#ff4444", label: "Very Dry", y: 20},
    {color: "#ff9800", label: "Dry", y: 30},
    {color: "#4caf50", label: "Optimal (Lower)", y: 40},
    {color: "#4caf50", label: "Optimal (Upper)", y: 60},
    {color: "#ff4444", label: "Humid", y: 70},
    {color: "#8b0000", label: "Extremely Humid", y: 85}
];
export const GAS_REFERENCE_LINES: SensorChartReferenceLineProps[] = [
    {color: "#4caf50", label: "Clean", y: 0},
    {color: "#4caf50", label: "Trace", y: 10},
    {color: "#ff9800", label: "Elevated", y: 25},
    {color: "#ff5722", label: "High", y: 40},
    {color: "#8b0000", label: "Dangerous", y: 60},
    {color: "#340000", label: "Critical", y: 80}
];

export const GENERAL_SAFETY_LEVELS: GeneralSafetyLevelProps[] = [
    {
        label: "Unknown",
        color: "#a1a1a1",
        range: ["#a1a1a1"]
    },
    {
        label: "Good",
        color: "#4caf50",
        range: [
            "#6495ed","#4caf50"
        ]
    },
    {
        label: "Warning",
        color: "#ff9800",
        range: [
            "#4169e1", "#ff9800", "#ff5722", "#ff4444"
        ]
    },
    {
        label: "Danger",
        color: "#8b0000",
        range: [
            "#1e90ff", "#8b0000", "#340000"
        ]
    }
];
