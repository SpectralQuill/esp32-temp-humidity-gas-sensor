import { TooltipProps } from "recharts";
import { format as formatDate } from "date-fns";
import { hexColor } from "../taggedTemplates/hexColor";
import {
    NameType,
    Payload,
    ValueType
} from "recharts/types/component/DefaultTooltipContent";
import { SafetyLevel } from "../utils/SafetyLevel";

export interface SensorTooltipProps extends TooltipProps<ValueType, NameType> {
    label?: number;
    payload?: Payload<ValueType, NameType>[];
    unit: string;
    formatReadingValue(value?: number | null): string;
}

const {
    GENERAL_SAFETY_LEVELS, REFERENCE_LINES_MAP,
    getReferenceLine, getSafetyLevelIndexByColor
} = SafetyLevel;

export function SensorTooltip({
    active, label, payload, unit,
    formatReadingValue
}: SensorTooltipProps) {

    if (!active || !payload || !payload.length) return <></>;
    if (!payload[0]) return <></>;
    
    const timestamp = label as number | undefined;
    const readingTypeLabel = payload[0].name as string | undefined;
    const sensorReadingType = payload[0].dataKey as SensorReadingType | undefined;
    const value = (payload[0].value ?? null) as number | null;
    const readingColor = payload[0].color;

    if (!timestamp || !readingTypeLabel || !sensorReadingType || value === undefined)
        return <></>;

    const referenceLines = REFERENCE_LINES_MAP[sensorReadingType];
    const {
        color: referenceLineColor,
        label: referenceLineLabel
    } = getReferenceLine(referenceLines, value);
    const generalSafetyLevelIndex: number = getSafetyLevelIndexByColor(referenceLineColor);
    const {
        color: generalSafetyLevelColor,
        label: generalSafetyLevelLabel
    } = GENERAL_SAFETY_LEVELS[generalSafetyLevelIndex];

    return <>
        <div className="sensor-tooltip">
            <ul className="no-list-style">
                <li style={{color: '#888'}}>
                    Time: {formatDate(timestamp, "hh:mm:ss a")}
                </li>
                <li style={{color: hexColor`${readingColor}`}}>
                    {readingTypeLabel}: {formatReadingValue(value)}{unit}
                </li>
                <li style={{color: hexColor`${referenceLineColor}`}}>
                    {referenceLineLabel}
                </li>
                <li style={{color: hexColor`${generalSafetyLevelColor}`}}>
                    {generalSafetyLevelLabel}
                </li>
            </ul>
        </div>
    </>;
    
}
