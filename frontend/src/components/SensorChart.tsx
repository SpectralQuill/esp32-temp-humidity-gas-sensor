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
import { useContext } from "react";

export interface SensorChartDataPoint {
    time: string;
    temperatureC: number | null;
    humidity: number | null;
    gas: number | null;
}

export interface SensorChartReferenceLineProps {
    color: string,
    label: string,
    y: number
}

export interface SensorChartProps {
    color: string;
    dataKey: SensorReadingType;
    readingTypeLabel: string;
    referenceLines: SensorChartReferenceLineProps[]
    unit: string;
    yAxisDomain: AxisDomain;
    formatReadingValue(value?: number): string;
}

export function SensorChart(props: SensorChartProps) {

    const {chartData} = useContext(AppContext);
    const {
        color, dataKey, readingTypeLabel, referenceLines, unit, yAxisDomain,
        formatReadingValue
    } = props;

    return <>
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                />
                <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                />
                <YAxis
                    label={{
                        value: unit,
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                    }}
                    tick={{ fontSize: 12 }}
                    domain={yAxisDomain}
                />
                {referenceLines.map(({color, label, y}) => <ReferenceLine
                    y={y}
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{
                        value: label,
                        position: "insideBottomLeft",
                        fill: color,
                        fontSize: 10,
                    }}
                />)}
                {/* Reference Lines for Temperature */}
                {/* <ReferenceLine
                    y={TEMPERATURE_LEVELS.EXTREME_COLD}
                    stroke="#8b0000"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{
                        value: "Extreme Cold",
                        position: "insideBottomLeft",
                        fill: "#8b0000",
                        fontSize: 10,
                    }}
                />
                <ReferenceLine
                    y={TEMPERATURE_LEVELS.DANGER_COLD}
                    stroke="#ff4444"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                />
                <ReferenceLine
                    y={TEMPERATURE_LEVELS.COMFORT_LOW}
                    stroke="#4caf50"
                    strokeWidth={1}
                />
                <ReferenceLine
                    y={TEMPERATURE_LEVELS.COMFORT_HIGH}
                    stroke="#4caf50"
                    strokeWidth={1}
                />
                <ReferenceLine
                    y={TEMPERATURE_LEVELS.DANGER_HOT}
                    stroke="#ff4444"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                />
                <ReferenceLine
                    y={TEMPERATURE_LEVELS.EXTREME_HOT}
                    stroke="#8b0000"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{
                        value: "Extreme Heat",
                        position: "insideTopLeft",
                        fill: "#8b0000",
                        fontSize: 10,
                    }}
                /> */}
                <Tooltip
                    formatter={
                        (value?: number) => ([formatReadingValue(value) + unit, readingTypeLabel])
                    }
                    labelFormatter={(label) => `Time: ${label}`}
                />
                <Legend />
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name={readingTypeLabel}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    connectNulls={true}
                />
            </AreaChart>
        </ResponsiveContainer>
    </>;

}
