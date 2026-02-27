// import { addMilliseconds } from "date-fns";
// import { ArrayUtils } from "../utils/ArrayUtils";
// import { DateRange } from "../utils/DateRange";
// import { Esp32Api } from "../api/Esp32Api";
// import {
//     useEffect,
//     useState
// } from "react";

// export function compareDates(a: Date, b: Date): number {

//     return a.getTime() - b.getTime();

// }

// export function useSensorReadings(
//     api: Esp32Api,
//     dateRange: DateRange,
//     active: boolean
// ): SensorReading[] {

//     const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
//     const [_dateRange, setDateRange] = useState<DateRange>(dateRange);

//     useEffect(() => {(async() => {

//         if (!active) return;
//         // setSensorReadings(await api.getReadings(...dateRange.toArray()));
//         if (
//             (sensorReadings.length === 0)
//             || !dateRange.overlapsWithDateRange(_dateRange)
//         ) {

//             setSensorReadings(await api.getReadings(...dateRange.toArray()));
//             return;

//         }

//         const dates: Date[] = sensorReadings.map(({ createdAt }) => createdAt);
//         const [oldStartDate, oldEndDate] = _dateRange.toArray();
//         const [newStartDate, newEndDate] = dateRange.toArray();
//         let startIndex: number = 0;
//         let endIndex: number = sensorReadings.length;
//         let leftSensorReadings: SensorReading[] = [];
//         let rightSensorReadings: SensorReading[] = [];

//         if (newEndDate > oldEndDate)
//             rightSensorReadings = await api.getReadings(
//                 oldEndDate, newEndDate, true, false
//             );
//         else if (newEndDate < oldEndDate)
//             endIndex = ArrayUtils.binarySearchIndex(
//                 dates, addMilliseconds(oldEndDate, 1), compareDates
//             );

//         if (newStartDate > oldStartDate)
//             startIndex = ArrayUtils.binarySearchIndex(
//                 dates, newStartDate, compareDates
//             );
//         else if (newStartDate < oldStartDate)
//             leftSensorReadings = await api.getReadings(
//                 newStartDate, oldStartDate, false, true
//             );

//         setSensorReadings([
//             ...leftSensorReadings,
//             ...sensorReadings.slice(startIndex, endIndex),
//             ...rightSensorReadings
//         ]);
//         setDateRange(dateRange);

//     })()}, [dateRange, active]);

//     return sensorReadings;

// }


import { useEffect, useRef, useState } from "react";
import { addMilliseconds } from "date-fns";
import { ArrayUtils } from "../utils/ArrayUtils";
import { DateRange } from "../utils/DateRange";
import { Esp32Api } from "../api/Esp32Api";

export function compareDates(a: Date, b: Date): number {
    return a.getTime() - b.getTime();
}

export function useSensorReadings(
    api: Esp32Api,
    dateRange: DateRange,
    active: boolean
): SensorReading[] {

    const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
    const oldDateRangeRef = useRef<DateRange | null>(null);

    useEffect(() => {

        if (!active) return;
        let cancelled = false;
        (async () => {

            const previousRange = oldDateRangeRef.current;
            if (
                !previousRange ||
                !dateRange.overlapsWithDateRange(previousRange)
            ) {
                const full = await api.getReadings(...dateRange.toArray());
                if (!cancelled) {
                    setSensorReadings(full);
                    oldDateRangeRef.current = dateRange;
                }
                return;
            }

            const [oldStartDate, oldEndDate] = previousRange.toArray();
            const [newStartDate, newEndDate] = dateRange.toArray();
            const leftPromise = (
                (newStartDate < oldStartDate) ? api.getReadings(
                    newStartDate, oldStartDate, false, true
                ) : Promise.resolve([])
            );
            const rightPromise = (
                (newEndDate > oldEndDate) ? api.getReadings(
                    oldEndDate, newEndDate, true, false
                ) : Promise.resolve([])
            );
            const [leftSensorReadings, rightSensorReadings] = await Promise.all([
                leftPromise, rightPromise
            ]);
            if (cancelled) return;

            setSensorReadings(oldSensorReadings => {
                const dates = oldSensorReadings.map(r => r.createdAt);

                let startIndex = 0;
                let endIndex = oldSensorReadings.length;

                if (newEndDate < oldEndDate)
                    endIndex = ArrayUtils.binarySearchIndex(
                        dates,
                        addMilliseconds(newEndDate, 1),
                        compareDates
                    );
                if (newStartDate > oldStartDate)
                    startIndex = ArrayUtils.binarySearchIndex(
                        dates,
                        newStartDate,
                        compareDates
                    );
                const middleSensorReadings = oldSensorReadings.slice(
                    startIndex, endIndex
                );

                return [
                    ...leftSensorReadings,
                    ...middleSensorReadings,
                    ...rightSensorReadings
                ];
            });

            oldDateRangeRef.current = dateRange;

        })();
        return () => {
            cancelled = true;
        };

    }, [dateRange, active]);

    return sensorReadings;
}
