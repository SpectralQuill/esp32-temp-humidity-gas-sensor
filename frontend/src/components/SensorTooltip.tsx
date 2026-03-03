import { format as formatDate } from "date-fns";
import { hexColor } from "../taggedTemplates/hexColor";
import { GeneralSafetyLevels } from "../constants/generalSafetyLevels";
import { getSafetyLevel } from "../hooks/useGeneralSafetyLevel";
import {
    NameType,
    Payload,
    ValueType
} from "recharts/types/component/DefaultTooltipContent";
import { SafetyLevelsMap } from "../hooks/useSafetyLevelsMap";
import { TooltipProps } from "recharts";

export interface SensorTooltipProps extends TooltipProps<ValueType, NameType> {
    label?: number;
    payload?: Payload<ValueType, NameType>[];
    safetyLevelsMap: SafetyLevelsMap;
    unit: string;
    formatReadingValue(value?: number | null): string;
}

export function SensorTooltip(props: SensorTooltipProps) {

    const {
        active, label, payload, safetyLevelsMap, unit,
        formatReadingValue
    } = props;
    if (!active || !payload || !payload.length || !payload[0]) return <></>;
    
    const timestamp = label as number | undefined;
    const readingType = payload[0].dataKey as SensorReadingType | undefined;
    const readingTypeLabel = payload[0].name as string | undefined;
    const readingTypeColor = payload[0].color;
    const value = (payload[0].value ?? null) as number | null;
    if (!timestamp || !readingTypeLabel || !readingType || value == undefined)
        return <></>;

    const measurementSafetyLevels: SafetyLevel[] = safetyLevelsMap[readingType];
    const measurementSafetyLevel: SafetyLevel = getSafetyLevel(measurementSafetyLevels, value)
    if (!measurementSafetyLevel)
        return <></>;

    const generalSafetyLevelIndex = GeneralSafetyLevels[measurementSafetyLevel.level];
    const generalSafetyLevel = safetyLevelsMap.general[generalSafetyLevelIndex];
    if (!generalSafetyLevel)
        return <></>;

    const {
        label: measurementSafetyLevelLabel,
        color: measurementSafetyLevelColor
    } = measurementSafetyLevel;
    const {
        label: generalSafetyLevelLabel,
        color: generalSafetyLevelColor
    } = generalSafetyLevel;

    return <>
        <div className="sensor-tooltip">
            <ul className="no-list-style">
                <li style={{color: '#888'}}>
                    {formatDate(timestamp, "MMM dd, yyyy - hh:mm:ss a")}
                </li>
                <li style={{color: hexColor`${readingTypeColor}`}}>
                    {readingTypeLabel}: {formatReadingValue(value)}{unit}
                </li>
                <li style={{color: hexColor`${measurementSafetyLevelColor}`}}>
                    {measurementSafetyLevelLabel}
                </li>
                <li style={{color: hexColor`${generalSafetyLevelColor}`}}>
                    {generalSafetyLevelLabel}
                </li>
            </ul>
        </div>
    </>;
    
}
