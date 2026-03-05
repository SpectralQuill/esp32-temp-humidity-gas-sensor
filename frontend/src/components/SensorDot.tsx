import {
    Dot,
    DotProps
} from "recharts";
import { getSafetyLevel } from "../hooks/useGeneralSafetyLevel";
import { hexColor } from "../taggedTemplates/hexColor";

export interface SensorDotProps extends DotProps {
    colorBasis: "readingType" | "generalSafetyLevel",
    r?: number,
    readingType: SensorReadingType;
    readingTypeColor: string;
    payload?: SensorChartPoint;
    safetyLevels: SafetyLevel[];
}

export function SensorDot(props: SensorDotProps) {

    const {
        colorBasis, cx, cy, payload, r: radius, readingType, readingTypeColor, safetyLevels
    } = props;
    let color = "#a1a1a1";

    const value = payload?.[readingType];
    if (value != undefined) switch (colorBasis) {

        case "generalSafetyLevel":
            const safetyLevel = getSafetyLevel(safetyLevels, value);
            color = safetyLevel.color;
            break;
        case "readingType":
            color = readingTypeColor;
            break;

    }

    return <>
        <Dot
            cx={cx}
            cy={cy}
            r={radius}
            fill={hexColor`${color}`}
        />
    </>;

};


