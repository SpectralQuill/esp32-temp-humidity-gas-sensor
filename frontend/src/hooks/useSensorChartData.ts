import { AxisTick } from "recharts/types/util/types";
import { DateRange } from "../utils/DateRange";
import { SensorChartRange } from "../constants/sensorChartRangesData";
import {
    useEffect,
    useMemo,
    useRef
} from "react";

export function useSensorChartData(
    sensorReadings: SensorReading[],
    dateRange: DateRange,
    sensorChartRange: SensorChartRange,
    active: boolean
): [SensorChartPoint[], AxisTick[]] {

    const sensorChartPointsRef = useRef<SensorChartPoint[]>([]);
    const sensorAxisTicksRef = useRef<AxisTick[]>([]);
    const [sensorChartPoints, sensorChartAxisTicks] = useMemo(() => {

        const { startDate, endDate } = dateRange;
        if (!active || (
            (sensorReadings.length > 0) && (
                (sensorReadings[0].createdAt < startDate)
                || (sensorReadings[sensorReadings.length - 1].createdAt > endDate)
            )
        )) return [sensorChartPointsRef.current, sensorAxisTicksRef.current];

        const sensorChartPoints: SensorChartPoint[] = sensorReadings.map(({
            createdAt, temperatureC, humidity, gas
        }) => ({
            timestamp: createdAt.getTime(),
            temperatureC, humidity, gas
        }));
        const { rangeMs, tickIntervalMs } = sensorChartRange;
        const tickGapsCount = Math.floor(rangeMs / tickIntervalMs);
        const sensorChartAxisTicks: AxisTick[] = [];
        const endDateMs: number = endDate.getTime();

        for (
            let timestamp = endDateMs - (tickIntervalMs * tickGapsCount);
            timestamp <= endDateMs;
            timestamp += tickIntervalMs
        ) sensorChartAxisTicks.push(timestamp);

        return [sensorChartPoints, sensorChartAxisTicks];

    }, [sensorReadings, dateRange, sensorChartRange, active]);

    useEffect(() => {

        sensorChartPointsRef.current = sensorChartPoints;
        sensorAxisTicksRef.current = sensorChartAxisTicks;

    }, [sensorChartPoints, sensorChartAxisTicks]);

    return [sensorChartPoints, sensorChartAxisTicks];

}
