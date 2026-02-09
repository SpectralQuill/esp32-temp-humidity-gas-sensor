import { AppContext } from "../contexts/AppContext";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    Line,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { format as formatDate } from "date-fns";
import { SensorCard } from "./SensorCard";
import { SensorChartReferenceLineProps } from "../constants/safetyLevels";
import { SensorTooltip } from "./SensorTooltip";
import { useContext } from "react";

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

    const {
        color, dataKey, readingTypeLabel, referenceLines, unit, yAxisDomain,
        formatReadingValue
    } = props;
    const {sensorChartData, sensorChartXTicks} = useContext(AppContext);

    return <>
        <SensorCard
            color={color}
            dataKey={dataKey}
            readingTypeLabel={readingTypeLabel}
            unit={unit}
            formatReadingValue={formatReadingValue}
        />
        <ResponsiveContainer className="sensor-chart" width="100%" height={300}>
            <AreaChart data={sensorChartData}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                />
                <XAxis
                    dataKey="timestamp"
                    tick={{ fontSize: 12 }}
                    ticks={sensorChartXTicks}
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
                    domain={yAxisDomain}
                />
                {referenceLines.map(({color, label, y}) => <ReferenceLine
                    key={y}
                    y={y}
                    stroke={color}
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    label={{
                        value: label,
                        position: "insideBottomLeft",
                        fill: color,
                        fontSize: 10,
                    }}
                />)}
                <Tooltip content={ <SensorTooltip /> }/>
                <Line type="monotone" dataKey="value" stroke={color}/>
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

