import {
    GAS_REFERENCE_LINES,
    HUMIDITY_REFERENCE_LINES,
    TEMPERATURE_C_REFERENCE_LINES
} from "../constants/safetyLevels";
import { SensorChart } from "./SensorChart";

export function Dashboard() {

    const formatPercentageValue = (value: number | undefined) =>
        (value !== undefined) ? value.toFixed(0) : '--'
    ;
    const formatTemperatureCValue = (value: number | undefined) =>
        (value !== undefined) ? value.toFixed(1) : '--'
    ;

    return <>
        <main>
            <SensorChart
                color="#ff7300"
                dataKey="temperatureC"
                readingTypeLabel="Temperature"
                referenceLines={TEMPERATURE_C_REFERENCE_LINES}
                unit="°C"
                yAxisDomain={[
                    (dataMin: number) => Math.min(0, dataMin + 1),
                    (dataMax: number) => Math.max(42, dataMax + 1),
                ]}
                formatReadingValue={formatTemperatureCValue}
            />
            <SensorChart
                color="#0088ff"
                dataKey="humidity"
                readingTypeLabel="Humidity"
                referenceLines={HUMIDITY_REFERENCE_LINES}
                unit="%"
                yAxisDomain={[0, 100]}
                formatReadingValue={formatPercentageValue}
            />
            <SensorChart
                color="#00cc88"
                dataKey="gas"
                readingTypeLabel="Gas"
                referenceLines={GAS_REFERENCE_LINES}
                unit="%"
                yAxisDomain={[0, 100]}
                formatReadingValue={formatPercentageValue}
            />
        </main>
    </>;
}
