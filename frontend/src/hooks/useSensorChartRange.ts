import { ArrayUtils } from "../utils/ArrayUtils";
import { DateRange } from "../utils/DateRange";
import {
    SensorChartRange,
    SENSOR_CHART_RANGES
} from "../constants/sensorChartRangesData";
import {
    useEffect,
    useState
} from "react";

export function useSensorChartRange(
    dateRange: DateRange,
    active: boolean
): SensorChartRange {

    const [sensorChartRange, setSensorChartRange] = useState<SensorChartRange>(
        SENSOR_CHART_RANGES[0]
    );

    useEffect(() => setSensorChartRange(sensorChartRange => {

        if (!active) return sensorChartRange;

        const { rangeMs } = dateRange;
        const index = ArrayUtils.binarySearchIndex(
            SENSOR_CHART_RANGES,
            { rangeMs } as SensorChartRange,
            compareSensorChartRanges
        );
        sensorChartRange = SENSOR_CHART_RANGES[index];
        if (!sensorChartRange)
            throw new Error(`Date range of ${rangeMs}ms is far too large for the chart`);
        
        return sensorChartRange;

    }), [dateRange, active]);

    return sensorChartRange;

}

export function compareSensorChartRanges(
    a: SensorChartRange,
    b: SensorChartRange
): number {

    return a.rangeMs - b.rangeMs;

}
