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
        tickIntervalMs: secondsToMilliseconds(10)
    },
    {
        label: "5 minutes",
        rangeMs: minutesToMilliseconds(5),
        pointIntervalMs: secondsToMilliseconds(10),
        tickIntervalMs: minutesToMilliseconds(1)
    },
    {
        label: "30 minutes",
        rangeMs: minutesToMilliseconds(30),
        pointIntervalMs: minutesToMilliseconds(1),
        tickIntervalMs: minutesToMilliseconds(5)
    },
    {
        label: "1 hour",
        rangeMs: hoursToMilliseconds(1),
        pointIntervalMs: minutesToMilliseconds(2),
        tickIntervalMs: minutesToMilliseconds(10)
    },
    {
        label: "6 hours",
        rangeMs: hoursToMilliseconds(6),
        pointIntervalMs: minutesToMilliseconds(20),
        tickIntervalMs: hoursToMilliseconds(1)
    },
    {
        label: "1 day",
        rangeMs: daysToMilliseconds(1),
        pointIntervalMs: hoursToMilliseconds(1),
        tickIntervalMs: hoursToMilliseconds(4)
    },
    {
        label: "30 days",
        rangeMs: daysToMilliseconds(30),
        pointIntervalMs: daysToMilliseconds(1),
        tickIntervalMs: daysToMilliseconds(5)
    }
] as const satisfies ReadonlyArray<SensorChartRange>;

export function daysToMilliseconds(
    days: number
): number {

    return hoursToMilliseconds(24 * days);

}
