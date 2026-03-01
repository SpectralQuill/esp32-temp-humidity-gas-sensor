import { addMilliseconds } from "date-fns";
import { ArrayUtils } from "../utils/ArrayUtils";
import { DateRange } from "../utils/DateRange";
import { Esp32Api } from "../services/Esp32Api";
import {
    useEffect,
    useRef,
    useState
} from "react";

export function useSensorReadings(
    api: Esp32Api,
    dateRange: DateRange,
    active: boolean
): SensorReading[] {

    const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
    const oldDateRangeRef = useRef<DateRange | null>(null);
    const requestIdRef = useRef<number>(1);

    useEffect(() => {

        if (!active) return;

        let cancelled = false;
        const handleUpdate = async () => {

            const requestId = ++requestIdRef.current;
            if (cancelled) return;
            const { current: oldDateRange } = oldDateRangeRef;

            if (!oldDateRange || !dateRange.overlapsWithDateRange(oldDateRange)) {
                const sensorReadings = await api.getReadings(...dateRange.toArray());
                if (requestIdRef.current !== requestId || cancelled) return;
                setSensorReadings(sensorReadings);
                oldDateRangeRef.current = dateRange;
                return;
            }

            const [oldStartDate, oldEndDate] = oldDateRange.toArray();
            const [newStartDate, newEndDate] = dateRange.toArray();
            const [leftSensorReadings, rightSensorReadings] = await Promise.all([
                (newStartDate < oldStartDate) ? api.getReadings(
                    newStartDate, oldStartDate, false, true
                ) : [],
                (newEndDate > oldEndDate) ? api.getReadings(
                    oldEndDate, newEndDate, true, false
                ) : []
            ]);
            if (requestIdRef.current !== requestId || cancelled) return;

            setSensorReadings(sensorReadings => {
                let startIndex = 0;
                let endIndex = sensorReadings.length;
                if (newEndDate < oldEndDate) endIndex = ArrayUtils.binarySearchIndex(
                    sensorReadings,
                    { createdAt: addMilliseconds(newEndDate, 1) } as SensorReading,
                    compareSensorReadings
                );
                if (newStartDate > oldStartDate) startIndex = ArrayUtils.binarySearchIndex(
                    sensorReadings,
                    { createdAt: newStartDate } as SensorReading,
                    compareSensorReadings,
                    0,
                    endIndex
                );
                const middleSensorReadings = sensorReadings.slice(startIndex, endIndex);
                return [
                    ...leftSensorReadings,
                    ...middleSensorReadings,
                    ...rightSensorReadings
                ];
            });

            oldDateRangeRef.current = dateRange;

        };
        handleUpdate();

        return () => { cancelled = true; };

    }, [api, dateRange, active]);

    return sensorReadings;

}

export function compareSensorReadings(
    a: SensorReading,
    b: SensorReading
): number {

    return a.createdAt.getTime() - b.createdAt.getTime();

}
