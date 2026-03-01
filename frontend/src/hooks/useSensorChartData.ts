import { AxisTick } from "recharts/types/util/types";
import { DateRange } from "../utils/DateRange";
import { DateUtils } from "../utils/DateUtils";
import {
    SensorChartRange,
    SENSOR_CHART_RANGES
} from "../constants/sensorChartRangesData";
import {
    useEffect,
    useMemo,
    useRef
} from "react";

export type SensortChartBucket = {
    temperatureC: number;
    humidity: number;
    gas: number;
    readingsCount: number;
};

export const SENSOR_CHART_BUCKET_TEMPLATE = {
    temperatureC: 0,
    humidity: 0,
    gas: 0,
    readingsCount: 0
} as const satisfies SensortChartBucket;

export function useSensorChartData(
    sensorReadings: SensorReading[],
    dateRange: DateRange,
    active: boolean
): [SensorChartPoint[], AxisTick[], SensorChartRange] {

    const oldSensorChartPointsRef = useRef<SensorChartPoint[]>([]);
    const oldSensorAxisTicksRef = useRef<AxisTick[]>([]);
    const oldSensorChartRangeRef = useRef<SensorChartRange>(
        getSensorChartRange(dateRange)
    );
    const [sensorChartPoints, sensorChartAxisTicks, sensorChartRange] = useMemo(() => {

        const { startDate, endDate } = dateRange;
        if (
            !active
            || (
                (sensorReadings.length > 0) && (
                    (sensorReadings[0].createdAt < startDate)
                    || (sensorReadings[sensorReadings.length - 1].createdAt > endDate)
                )
            )
        ) return [
            oldSensorChartPointsRef.current,
            oldSensorAxisTicksRef.current,
            oldSensorChartRangeRef.current
        ];

        const sensorChartRange = getSensorChartRange(dateRange);
        const { rangeMs, pointIntervalMs, tickIntervalMs } = sensorChartRange;

        const endDateMs = endDate.getTime();
        const pointGapsCount = Math.floor(rangeMs / pointIntervalMs);
        const tickGapsCount = Math.floor(rangeMs / tickIntervalMs);
        const pointOffsetMs = endDateMs - (pointIntervalMs * pointGapsCount);

        const buckets = new Map<number, SensortChartBucket>();
        const sensorChartPoints: SensorChartPoint[] = [];
        const sensorChartAxisTicks: AxisTick[] = [];

        for (const { createdAt, temperatureC, humidity, gas } of sensorReadings) {

            const timestamp = DateUtils.bucket(createdAt, pointIntervalMs, pointOffsetMs);
            if (!buckets.has(timestamp))
                buckets.set(timestamp, { ...SENSOR_CHART_BUCKET_TEMPLATE });
            const bucket = buckets.get(timestamp)!;
            bucket.temperatureC += temperatureC;
            bucket.humidity += humidity;
            bucket.gas += gas;
            bucket.readingsCount++;
            
        }
        for (let [
            timestamp,
            { temperatureC, humidity, gas, readingsCount }
        ] of buckets) {

            temperatureC /= readingsCount;
            humidity /= readingsCount;
            gas /= readingsCount;
            sensorChartPoints.push({ timestamp, temperatureC, humidity, gas });

        }
        for (
            let timestamp = endDateMs - (tickIntervalMs * tickGapsCount);
            timestamp <= endDateMs;
            timestamp += tickIntervalMs
        ) sensorChartAxisTicks.push(timestamp);
        return [sensorChartPoints, sensorChartAxisTicks, sensorChartRange];

    }, [sensorReadings, active]);

    useEffect(() => {

        oldSensorChartPointsRef.current = sensorChartPoints;
        oldSensorAxisTicksRef.current = sensorChartAxisTicks;
        oldSensorChartRangeRef.current = sensorChartRange;

    }, [sensorChartPoints, sensorChartAxisTicks, sensorChartRange]);

    return [sensorChartPoints, sensorChartAxisTicks, sensorChartRange];

}

export function getSensorChartRange(
    dateRange: DateRange
): SensorChartRange {

    const difference = dateRange.endDate.getTime() - dateRange.startDate.getTime();
    for (let sensorChartRange of SENSOR_CHART_RANGES)
        if (difference <= sensorChartRange.rangeMs)
            return sensorChartRange;
    throw new Error(`Date range of ${difference}ms is far too large for the chart`);

}
