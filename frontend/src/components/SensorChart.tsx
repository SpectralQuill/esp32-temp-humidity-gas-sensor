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
import { SensorCard } from "./SensorCard";
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
    const { safetyLevelsMap, sensorChartPoints, sensorChartAxisTicks } = useContext(AppContext);
    const safetyLevels = safetyLevelsMap[readingType];

    return <>
        <div className="sensor-chart-wrapper">
            <SensorCard
                color={color}
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
                        stroke={`#` + color}
                        strokeWidth={1.5}
                        label={{
                            value: label,
                            position: "insideBottomLeft",
                            fill: color,
                            fontSize: 10,
                        }}
                    />)}
                    <Tooltip content={
                        <SensorTooltip
                            unit={unit}
                            formatReadingValue={formatReadingValue}
                        />
                    }/>
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey={readingType}
                        stroke={`#` + color}
                        fill={`#` + color}
                        fillOpacity={0.3}
                        strokeWidth={2}
                        name={name}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                        connectNulls={true}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </>;

}

