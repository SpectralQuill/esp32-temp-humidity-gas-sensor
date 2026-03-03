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
    active: boolean,
    reconnectToApi: () => void
): SensorReading[] {

    const sensorReadingsRef = useRef<SensorReading[]>([]);
    const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
    const oldDateRangeRef = useRef<DateRange | null>(null);
    const requestIdRef = useRef<number>(1);

    useEffect(() => {

        if (!active) return;
        let cancelled = false;
        const handleUpdate = async () => {
            const requestId = ++requestIdRef.current;
            if (cancelled) return;
            const oldDateRange = oldDateRangeRef.current;
            try {

                if (!oldDateRange || !dateRange.overlapsWithDateRange(oldDateRange)) {

                    const readings = await api.getReadings(...dateRange.toArray());
                    if (cancelled || requestIdRef.current !== requestId) return;
                    sensorReadingsRef.current = readings;
                    
                } else {

                    const [oldStartDate, oldEndDate] = oldDateRange.toArray();
                    const [newStartDate, newEndDate] = dateRange.toArray();

                    let startIndex = 0;
                    let endIndex = sensorReadingsRef.current.length;
                    if (newStartDate > oldStartDate)
                        startIndex = ArrayUtils.binarySearchIndex(
                            sensorReadingsRef.current,
                            { createdAt: newStartDate } as SensorReading,
                            compareSensorReadings
                        );
                    if (newEndDate < oldEndDate)
                        endIndex = ArrayUtils.binarySearchIndex(
                            sensorReadingsRef.current,
                            { createdAt: addMilliseconds(newEndDate, 1) } as SensorReading,
                            compareSensorReadings,
                            startIndex
                        );
                    if (startIndex > 0) {

                        sensorReadingsRef.current.splice(0, startIndex);
                        endIndex -= startIndex;

                    }
                    if (endIndex < sensorReadingsRef.current.length)
                        sensorReadingsRef.current.splice(endIndex);

                    const [
                        leftSensorReadings, rightSensorReadings
                    ]: SensorReading[][] = await Promise.all([
                        (newStartDate < oldStartDate) ?
                            api.getReadings(newStartDate, oldStartDate, false, true)
                        : [],
                        (newEndDate > oldEndDate) ?
                            api.getReadings(oldEndDate, newEndDate, true, false)
                        : []
                    ]);
                    if (cancelled || requestIdRef.current !== requestId) return;
                    if (leftSensorReadings.length)
                        sensorReadingsRef.current.unshift(...leftSensorReadings);
                    if (rightSensorReadings.length)
                        sensorReadingsRef.current.push(...rightSensorReadings);

                }

                oldDateRangeRef.current = dateRange;

                if (cancelled || requestIdRef.current !== requestId) return;
                setSensorReadings([...sensorReadingsRef.current]);

            } catch {

                reconnectToApi();
                
            }
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
