import { TooltipProps } from "recharts";
import { format as formatDate } from "date-fns";
import { getGeneralSafetyLevel } from "../hooks/useSensorChartData";
import {
    NameType,
    Payload,
    ValueType
} from "recharts/types/component/DefaultTooltipContent";

export interface SensorTooltipProps extends TooltipProps<ValueType, NameType> {
    label?: number;
    payload?: Payload<ValueType, NameType>[];
}

export function SensorTooltip({
    active, payload, label
}: SensorTooltipProps) {

    if (!active || !payload || !payload.length) return <></>;
    if (!payload[0]) return <></>;
    
    const timestamp = label as number | undefined;
    const readingTypeLabel = payload[0].name as string | undefined;
    const value = payload[0].value as number | undefined;
    const readingColor = payload[0].color;
    // const a = getGeneralSafetyLevel()

    if (!timestamp || !readingTypeLabel || value === undefined) return <></>;
    return (
        <div className="sensor-tooltip">
            <span style={{color: '#888'}}>
                Time: {formatDate(timestamp, "hh:mm:ss a")}
            </span>
            <br />
            <span style={{color: readingColor}}>
                {readingTypeLabel}: {value}
            </span>
            <br />
            <span>
                Level Here
            </span>
        </div>
    );
}
