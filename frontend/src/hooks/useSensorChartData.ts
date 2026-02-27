import { addMinutes } from "date-fns";
import { AxisTick } from "recharts/types/util/types";
import { DateRange } from "../utils/DateRange";
import { DateUtils } from "../utils/DateUtils";
// import {
//     GeneralSafetyLevelProps,
//     SafetyLevel
// } from "../utils/SafetyLevel"
import { NumberUtils } from "../utils/NumberUtils";
// import { SensorApi } from "../api/SensorApi";
// import { TICK_POINT_MIN_INTERVAL_MAP } from "../constants/tickPointMinIntervalMap";
import {
    useEffect,
    useState
} from "react";

export interface SensorChartPointBucketData {
    [timestamp: number]: {
        temperatureC: number;
        humidity: number;
        gas: number;
    }[]
}

// const { GENERAL_SAFETY_LEVELS } = SafetyLevel;

export function useSensorChartData(
    sensorReadings: SensorReading[],
    dateRange: DateRange,
    points: number,
    active: boolean
): [SensorChartPoint[], AxisTick[]] {

    const [sensorChartPoints, setSensorChartPoints] = useState<SensorChartPoint[]>([]);
    const [sensorChartAxisTicks, setSensorChartAxisTicks] = useState<AxisTick[]>([]);

    // function handleUpdateChartPoints(
    //     sensorReadings: SensorReading[],
    //     intervalMs: number,
    //     offsetMs: number
    // ) {

        

    // }

    // const handleUpdateAxisTicks = (
    //     intervalMs: number,
    //     offsetMs: number
    // ) => {



    // }

    useEffect(() => {

        if (!active) return;
        const intervalMs: number = 1000;
        const offsetMs: number = dateRange.startDate.getTime();
            // has to be anchored at end date
        // handleUpdateChartPoints(sensorReadings, intervalMs, offsetMs);

        const sensorChartPoints: SensorChartPoint[] = [];
        const buckets: SensorChartPointBucketData = {};

        for(let { createdAt, temperatureC, humidity, gas } of sensorReadings) {

            const timestamp: number = DateUtils.bucket(createdAt, intervalMs, offsetMs);
            if (!buckets[timestamp]) buckets[timestamp] = [];
            buckets[timestamp].push({ temperatureC, humidity, gas });

        }
        for(let timestampStr in buckets) {

            const timestamp = Number(timestampStr);
            const bucket = buckets[timestamp];
            const { length } = bucket;
            const readingSums = bucket.reduce(
                (array, { temperatureC, humidity, gas }) => {
                    array[0] += temperatureC;
                    array[1] += humidity;
                    array[2] += gas
                    return array;
                }, [0, 0, 0]
            );
            const [temperatureC, humidity, gas] = readingSums.map(sum => sum / length);
            sensorChartPoints.push({ timestamp, temperatureC, humidity, gas });

        }

        setSensorChartPoints(sensorChartPoints);

        // handleUpdateAxisTicks(intervalMs, offsetMs);

    }, [sensorReadings, points, active]);

    return [sensorChartPoints, sensorChartAxisTicks];

    // const [sensorChartData, setSensorChartData] = useState<SensorChartData>([]);
    // const [xTicks, setXTicks] = useState<AxisTick[]>([]);
    // const [generalSafetyLevel, setGeneralSafetyLevel] = useState<GeneralSafetyLevelProps>(
    //     GENERAL_SAFETY_LEVELS[0]
    // );

    // useEffect(() => {(async() => {

    //     if(!active) return;

    //     const readingsList = await SensorApi.getReadings(startDate, endDate);
    //     const [temperatureReadings, humidityReadings, gasReadings] = readingsList;
    //     const [
    //         temperatureTimestamps, humidityTimestamps, gasTimestamps
    //     ]: number[][] = readingsList.map(readings => readings.map(
    //         ({createdAt}) => createdAt.getTime()
    //     ));
    //     let [
    //         temperatureTimestampIndex, humidityTimestampIndex, gasTimestampIndex
    //     ]: number[] = [0, 0, 0];
    //     const totalMinutes = differenceInMinutes(endDate, startDate);
    //     const [_, [tickMinInterval, pointMinInterval]] = Object.entries(TICK_POINT_MIN_INTERVAL_MAP)
    //         .find(
    //             ([treshold])=>(totalMinutes <= +treshold)
    //         )!;
    //     const offsetMin: number = startDate.getMinutes();
    //     const chartDataMap = new Map<string, SensorChartDataPoint>();
    //     const xTicksNew: AxisTick[] = [];
    //     startDate.setTime(bucketMsToMin(
    //         startDate.getTime(), pointMinInterval, offsetMin
    //     ));
    //     endDate.setTime(bucketMsToMin(
    //         endDate.getTime(), pointMinInterval, offsetMin
    //     ));
    //     let pointStartDate = new Date(startDate);
    //     let tickStartDate = new Date(startDate);

    //     while (tickStartDate <= endDate) {
    //         const timestamp: number = tickStartDate.getTime();
    //         xTicksNew.push(timestamp);
    //         tickStartDate = addMinutes(tickStartDate, +tickMinInterval);
    //     }
    //     while (pointStartDate <= endDate) {
    //         const timestamp: number = pointStartDate.getTime();
    //         if(temperatureTimestamps[temperatureTimestampIndex + 1] <= timestamp)
    //             temperatureTimestampIndex++;
    //         if(humidityTimestamps[humidityTimestampIndex + 1] <= timestamp)
    //             humidityTimestampIndex++;
    //         if(gasTimestamps[gasTimestampIndex + 1] <= timestamp)
    //             gasTimestampIndex++;
    //         addChartPoint(chartDataMap, new Date(timestamp), {
    //             temperatureC: readingsList[0][temperatureTimestampIndex].value,
    //             humidity: readingsList[1][humidityTimestampIndex].value,
    //             gas: readingsList[2][gasTimestampIndex].value
    //         });
    //         pointStartDate = addMinutes(pointStartDate, pointMinInterval);
    //     }

    //     setSensorChartData(Array.from(chartDataMap.values()));
    //     setXTicks(xTicksNew);
    //     setGeneralSafetyLevel(SafetyLevel.getGeneralSafetyLevel(
    //         temperatureReadings[temperatureReadings.length - 1].value,
    //         humidityReadings[humidityReadings.length - 1].value,
    //         gasReadings[gasReadings.length - 1].value
    //     ));

    // })()}, [endDate, active]);

    // return [sensorChartData, xTicks, generalSafetyLevel];

}

// function addChartPoint(
//     dataMap: Map<string, SensorChartDataPoint>,
//     date: Date,
//     updates: Partial<SensorChartDataPoint>
// ): void {
//     const timestamp: number = date.getTime();
//     const timestampString = String(timestamp);
//     if (dataMap.has(String(timestampString))) {
//         const existing = dataMap.get(timestampString)!;
//         if (updates.temperatureC === null) delete updates['temperatureC'];
//         if (updates.humidity === null) delete updates['humidity'];
//         if (updates.gas === null) delete updates['gas'];
//         Object.assign(existing, updates);
//     } else dataMap.set(timestampString, {
//         timestamp, temperatureC: null, humidity: null, gas: null, ...updates
//     });
// }
