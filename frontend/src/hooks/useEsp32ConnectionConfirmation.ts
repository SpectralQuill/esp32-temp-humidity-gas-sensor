import { DateRange } from "../utils/DateRange";
import { differenceInMilliseconds } from "date-fns";
import { useMemo } from "react";

export function useEsp32ConnectionConfirmation(
    sensorReadings: SensorReading[],
    dateRange: DateRange,
    refreshIntervalMs: number,
    marginMs: number
): boolean {

    return useMemo<boolean>(() => {

        const lastSensorReading = sensorReadings[sensorReadings.length - 1];
        if (!lastSensorReading) return false;
        const { createdAt } = lastSensorReading
        const { endDate } = dateRange;
        const difference = differenceInMilliseconds(endDate, createdAt);
        return (difference <= refreshIntervalMs + marginMs);

    }, [sensorReadings, dateRange, refreshIntervalMs, marginMs]);

}
