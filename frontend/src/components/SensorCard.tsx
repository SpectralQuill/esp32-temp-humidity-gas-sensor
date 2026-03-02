import { AppContext } from "../contexts/AppContext";
import { useContext } from "react";

import "../style/SensorChart.scss";

export interface SensorCardProps {
    color: string;
    name: string;
    readingType: SensorReadingType;
    unit: string;
    formatReadingValue(value?: number | null): string;
}

export function SensorCard(props: SensorCardProps) {

    const {
        color, readingType, name, unit,
        formatReadingValue
    } = props;
    const { sensorChartPoints } = useContext(AppContext);
    const lastIndex: number = sensorChartPoints.length - 1;
    const value: number | undefined =
        sensorChartPoints[lastIndex]?.[readingType] ?? undefined
    ;
    const hasValue: boolean = (value !== undefined);

    return <>
        <div className="sensor-card">
            <h4 className="font-large">
                {name}: {formatReadingValue(value)}{hasValue && unit}
            </h4>
        </div>
    </>;

}
