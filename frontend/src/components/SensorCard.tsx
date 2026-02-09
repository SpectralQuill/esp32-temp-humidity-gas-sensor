import { AppContext } from "../contexts/AppContext";
import { useContext } from "react";

import "../style/SensorCard.scss";

export interface SensorChartProps {
    color: string;
    dataKey: SensorReadingType;
    readingTypeLabel: string;
    unit: string;
    formatReadingValue(value?: number): string;
}

export function SensorCard(props: SensorChartProps) {

    const {
        color, dataKey, readingTypeLabel, unit,
        formatReadingValue
    } = props;
    const { sensorChartData } = useContext(AppContext);
    const value: number | undefined =
        sensorChartData[sensorChartData.length - 1]?.[dataKey] ?? undefined
    ;

    return <>
        <div className="sensor-card">
            <h4>{readingTypeLabel}</h4>
            <h3>{formatReadingValue(value)}{unit}</h3>
        </div>
    </>;

}
