import {
    hoursToMilliseconds,
    minutesToMilliseconds,
    secondsToMilliseconds
} from "date-fns";

export interface SensorChartRange {
    label: string,
    rangeMs: number,
    pointIntervalMs: number,
    tickIntervalMs: number
}

export const SENSOR_CHART_RANGES = [
    {
        label: "1 minute",
        rangeMs: minutesToMilliseconds(1),
        pointIntervalMs: secondsToMilliseconds(1),
        tickIntervalMs: secondsToMilliseconds(5)
    },
    {
        label: "5 minutes",
        rangeMs: minutesToMilliseconds(5),
        pointIntervalMs: secondsToMilliseconds(5),
        tickIntervalMs: secondsToMilliseconds(30)
    },
    {
        label: "30 minutes",
        rangeMs: minutesToMilliseconds(30),
        pointIntervalMs: secondsToMilliseconds(30),
        tickIntervalMs: minutesToMilliseconds(3)
    },
    {
        label: "1 hour",
        rangeMs: hoursToMilliseconds(1),
        pointIntervalMs: minutesToMilliseconds(1),
        tickIntervalMs: minutesToMilliseconds(5)
    },
    {
        label: "6 hours",
        rangeMs: hoursToMilliseconds(6),
        pointIntervalMs: minutesToMilliseconds(6),
        tickIntervalMs: minutesToMilliseconds(30)
    },
    {
        label: "1 day",
        rangeMs: daysToMilliseconds(1),
        pointIntervalMs: minutesToMilliseconds(30),
        tickIntervalMs: hoursToMilliseconds(12)
    },
    {
        label: "30 days",
        rangeMs: daysToMilliseconds(30),
        pointIntervalMs: hoursToMilliseconds(12),
        tickIntervalMs: daysToMilliseconds(2)
    }
] as const satisfies ReadonlyArray<SensorChartRange>;

export function daysToMilliseconds(
    days: number
): number {

    return hoursToMilliseconds(24 * days);

}
