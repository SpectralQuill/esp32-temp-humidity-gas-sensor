import { AppContext } from "../contexts/AppContext";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { format as formatDate } from "date-fns";
import { hexColor } from "../taggedTemplates/hexColor";
import { SensorCard } from "./SensorCard";
import { SensorDot } from "./SensorDot";
import { SensorTooltip } from "./SensorTooltip";
import { useContext } from "react";

import "../style/SensorChart.scss";

export interface SensorChartProps {
    color: string;
    name: string;
    readingType: SensorReadingType;
    unit: string;
    yAxisDomain: AxisDomain;
    formatReadingValue(value?: number | null): string;
    formatYTick?: (value: number) => string
}

export function SensorChart(props: SensorChartProps) {

    const {
        color, name, readingType, unit, yAxisDomain,
        formatReadingValue, formatYTick
    } = props;
    const {
        safetyLevelsMap, sensorChartPoints, sensorChartAxisTicks
    } = useContext(AppContext);
    const safetyLevels = safetyLevelsMap[readingType];

    return <>
        <div className="sensor-chart-wrapper">
            <SensorCard
                color={hexColor`${color}`}
                readingType={readingType}
                name={name}
                unit={unit}
                formatReadingValue={formatReadingValue}
            />
            <ResponsiveContainer className="sensor-chart" width="100%" height={300}>
                <AreaChart data={sensorChartPoints}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                    />
                    <XAxis
                        dataKey="timestamp"
                        tick={{ fontSize: 12 }}
                        ticks={sensorChartAxisTicks}
                        type="number"
                        domain={[
                            sensorChartAxisTicks[0],
                            sensorChartAxisTicks[sensorChartAxisTicks.length - 1]
                        ]}
                        interval="preserveStartEnd"
                        tickFormatter={(timestamp)=>formatDate(timestamp, "hh:mm a")}
                    />
                    <YAxis
                        label={{
                            value: unit,
                            angle: -90,
                            position: "insideLeft",
                            offset: 10,
                        }}
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatYTick}
                        domain={yAxisDomain}
                    />
                    {safetyLevels.map(({color, label, threshold}) => <ReferenceLine
                        key={threshold}
                        y={threshold}
                        stroke={hexColor`${color}`}
                        strokeWidth={1.5}
                        label={{
                            value: label,
                            position: "insideBottomLeft",
                            fill: hexColor`${color}`,
                            fontSize: 10,
                        }}
                    />)}
                    <Tooltip
                        isAnimationActive={false}
                        content={<SensorTooltip
                            isAnimationActive={false}
                            safetyLevelsMap={safetyLevelsMap}
                            unit={unit}
                            formatReadingValue={formatReadingValue}
                        />}
                    />
                    <Legend />
                    <Area
                        isAnimationActive={false}
                        type="monotone"
                        dataKey={readingType}
                        fill="none"
                        fillOpacity={1}
                        name={name}
                        dot={<SensorDot
                            {...props}
                            colorBasis="readingType"
                            r={3}
                            readingType={readingType}
                            readingTypeColor={color}
                            safetyLevels={safetyLevels}
                        />}
                        activeDot={<SensorDot
                            {...props}
                            colorBasis="generalSafetyLevel"
                            r={5}
                            readingType={readingType}
                            readingTypeColor={color}
                            safetyLevels={safetyLevels}
                        />}
                        stroke={hexColor`${color}`}
                        connectNulls={true}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </>;

}
