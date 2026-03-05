import { SensorChart } from "./SensorChart";

import "../style/Dashboard.scss";

export function Dashboard() {

    const formatTemperatureCValue = (value?: number | null) =>
        (value != null) ? value.toFixed(1) : '--'
    ;
    const formatPercentageValue = (value?: number | null) =>
        (value != null) ? (value * 100).toFixed(0) : '--'
    ;
    const formatPercentageYTick = (value: number) => String(100 * value);

    return <>
        <main>
            <SensorChart
                color="#ff7300"
                readingType="temperatureC"
                name="Temperature"
                unit="°C"
                yAxisDomain={[
                    (dataMin: number) => Math.min(0, dataMin + 1),
                    (dataMax: number) => Math.max(44, dataMax + 1),
                ]}
                formatReadingValue={formatTemperatureCValue}
            />
            <SensorChart
                color="#0088ff"
                readingType="humidity"
                name="Humidity"
                unit="%"
                yAxisDomain={[0, 1]}
                formatReadingValue={formatPercentageValue}
                formatYTick={formatPercentageYTick}
            />
            <SensorChart
                color="#00cc88"
                readingType="gas"
                name="Gas"
                unit="%"
                yAxisDomain={[0, 1]}
                formatReadingValue={formatPercentageValue}
                formatYTick={formatPercentageYTick}
            />
        </main>
    </>;
    
}
