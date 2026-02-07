import { SensorChart, SensorChartReferenceLineProps } from "./SensorChart";

const TEMPERATURE_C_REFERENCE_LINES: SensorChartReferenceLineProps[] = [
    {color: "#8b0000", label: "Extreme Cold", y: 5}
];

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
                    (dataMin: number) =>
                        Math.min(0, dataMin - 2),
                    (dataMax: number) =>
                        Math.max(39, dataMax + 2),
                ]}
                formatReadingValue={formatTemperatureCValue}
            />
        </main>
    </>;
}
