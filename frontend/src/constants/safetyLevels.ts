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
    {color: "#1e90ff", label: "Frost Risk", y: 0},
    {color: "#4169e1", label: "Very Cold", y: 5},
    {color: "#6495ed", label: "Cool", y: 12},
    {color: "#4caf50", label: "Optimal Comfort", y: 20},
    {color: "#4caf50", label: "Warm", y: 26},
    {color: "#ff9800", label: "Hot", y: 30},
    {color: "#ff4444", label: "Very Hot", y: 35},
    {color: "#8b0000", label: "Extreme Heat", y: 40}
];
export const HUMIDITY_REFERENCE_LINES: SensorChartReferenceLineProps[] = [
    {color: "#ff9800", label: "Dry", y: 30},
    {color: "#4caf50", label: "Lower Comfort", y: 40},
    {color: "#4caf50", label: "Upper Comfort", y: 60},
    {color: "#ff5722", label: "Humid", y: 70},
    {color: "#ff4444", label: "Too Humid", y: 80}
];
export const GAS_REFERENCE_LINES: SensorChartReferenceLineProps[] = [
    {color: "#4caf50", label: "Good", y: 10},
    {color: "#ff9800", label: "Poor", y: 20},
    {color: "#ff5722", label: "Unhealthy", y: 30},
    {color: "#ff4444", label: "Very Unhealthy", y: 40},
    {color: "#8b0000", label: "Hazardous", y: 60}
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
        range: ["#4caf50"]
    },
    {
        label: "Warning",
        color: "#ff9800",
        range: [
            "#4169e1", "#6495ed", "#ff9800", "#ff5722", "#ff4444"
        ]
    },
    {
        label: "Danger",
        color: "#8b0000",
        range: [
            "#1e90ff", "#8b0000"
        ]
    }
];
