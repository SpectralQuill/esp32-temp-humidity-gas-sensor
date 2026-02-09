import { addMinutes } from "date-fns";
import { AxisTick } from "recharts/types/util/types";
import { differenceInMinutes } from "date-fns";
import {
    GeneralSafetyLevelProps,
    SafetyLevel
} from "../utils/SafetyLevel"
import { SensorApi } from "../api/SensorApi";
import { TICK_POINT_MIN_INTERVAL_MAP } from "../constants/tickPointMinIntervalMap";
import { useEffect, useState } from "react";

const { GENERAL_SAFETY_LEVELS } = SafetyLevel;

export function useSensorChartData(
    startDate: Date,
    endDate: Date,
    active: boolean
): [SensorChartData, AxisTick[], GeneralSafetyLevelProps] {

    const [sensorChartData, setSensorChartData] = useState<SensorChartData>([]);
    const [xTicks, setXTicks] = useState<AxisTick[]>([]);
    const [generalSafetyLevel, setGeneralSafetyLevel] = useState<GeneralSafetyLevelProps>(
        GENERAL_SAFETY_LEVELS[0]
    );

    useEffect(() => {(async() => {

        if(!active) return;

        const readingsList = await SensorApi.getReadings(startDate, endDate);
        const [temperatureReadings, humidityReadings, gasReadings] = readingsList;
        const [
            temperatureTimestamps, humidityTimestamps, gasTimestamps
        ]: number[][] = readingsList.map(readings => readings.map(
            ({createdAt}) => createdAt.getTime()
        ));
        let [
            temperatureTimestampIndex, humidityTimestampIndex, gasTimestampIndex
        ]: number[] = [0, 0, 0];
        const totalMinutes = differenceInMinutes(endDate, startDate);
        const [_, [tickMinInterval, pointMinInterval]] = Object.entries(TICK_POINT_MIN_INTERVAL_MAP)
            .find(
                ([treshold])=>(totalMinutes <= +treshold)
            )!;
        const offsetMin: number = startDate.getMinutes();
        const chartDataMap = new Map<string, SensorChartDataPoint>();
        const xTicksNew: AxisTick[] = [];
        startDate.setTime(bucketMsToMin(
            startDate.getTime(), pointMinInterval, offsetMin
        ));
        endDate.setTime(bucketMsToMin(
            endDate.getTime(), pointMinInterval, offsetMin
        ));
        let pointStartDate = new Date(startDate);
        let tickStartDate = new Date(startDate);

        while (tickStartDate <= endDate) {
            const timestamp: number = tickStartDate.getTime();
            xTicksNew.push(timestamp);
            tickStartDate = addMinutes(tickStartDate, +tickMinInterval);
        }
        while (pointStartDate <= endDate) {
            const timestamp: number = pointStartDate.getTime();
            if(temperatureTimestamps[temperatureTimestampIndex + 1] <= timestamp)
                temperatureTimestampIndex++;
            if(humidityTimestamps[humidityTimestampIndex + 1] <= timestamp)
                humidityTimestampIndex++;
            if(gasTimestamps[gasTimestampIndex + 1] <= timestamp)
                gasTimestampIndex++;
            addChartPoint(chartDataMap, new Date(timestamp), {
                temperatureC: readingsList[0][temperatureTimestampIndex].value,
                humidity: readingsList[1][humidityTimestampIndex].value,
                gas: readingsList[2][gasTimestampIndex].value
            });
            pointStartDate = addMinutes(pointStartDate, pointMinInterval);
        }

        setSensorChartData(Array.from(chartDataMap.values()));
        setXTicks(xTicksNew);
        setGeneralSafetyLevel(SafetyLevel.getGeneralSafetyLevel(
            temperatureReadings[temperatureReadings.length - 1].value,
            humidityReadings[humidityReadings.length - 1].value,
            gasReadings[gasReadings.length - 1].value
        ));

    })()}, [endDate, active]);

    return [sensorChartData, xTicks, generalSafetyLevel];

}

function addChartPoint(
    dataMap: Map<string, SensorChartDataPoint>,
    date: Date,
    updates: Partial<SensorChartDataPoint>
): void {
    const timestamp: number = date.getTime();
    const timestampString = String(timestamp);
    if (dataMap.has(String(timestampString))) {
        const existing = dataMap.get(timestampString)!;
        if (updates.temperatureC === null) delete updates['temperatureC'];
        if (updates.humidity === null) delete updates['humidity'];
        if (updates.gas === null) delete updates['gas'];
        Object.assign(existing, updates);
    } else dataMap.set(timestampString, {
        timestamp, temperatureC: null, humidity: null, gas: null, ...updates
    });
}

export function bucketMsToMin(ms: number, bucketMin: number, offsetMin: number) {

    const bucketMs = bucketMin * 60000;
    const offsetMs = offsetMin * 60000;
    return Math.floor((ms - offsetMs) / bucketMs) * bucketMs + offsetMs;

}

// export function getGeneralSafetyLevel(
//     temperatureC: number | null,
//     humidity: number | null,
//     gas: number | null
// ): GeneralSafetyLevelProps {

//     const values = [temperatureC, humidity, gas];
//     const referenceLines = [
//         TEMPERATURE_C_REFERENCE_LINES, HUMIDITY_REFERENCE_LINES, GAS_REFERENCE_LINES
//     ].map((referenceLines, referenceLinesIndex) => {
//         if(values[referenceLinesIndex] === null) {
//             const { label, color } = GENERAL_SAFETY_LEVELS[0];
//             const referenceLine: SensorChartReferenceLineProps = { label, color, y: 0 };
//             return referenceLine;
//         }
//         let referenceLineIndex: number = referenceLines.findIndex(
//             ({y: treshold}) => (values[referenceLinesIndex]! < treshold)
//         );
//         if(referenceLineIndex < 0) return referenceLines[referenceLines.length - 1];
//         referenceLineIndex = Math.max(referenceLineIndex - 1, 0);
//         return referenceLines[referenceLineIndex];
//     });
//     let safetyLevelIndex = 0;

//     referenceLines.forEach(({color}) => {
//         const currentSafetyLevelIndex: number = GENERAL_SAFETY_LEVELS.findIndex(
//             ({range}) => range.includes(color)
//         );
//         if(currentSafetyLevelIndex > safetyLevelIndex) safetyLevelIndex = currentSafetyLevelIndex;
//     });

//     return GENERAL_SAFETY_LEVELS[safetyLevelIndex];

// }
