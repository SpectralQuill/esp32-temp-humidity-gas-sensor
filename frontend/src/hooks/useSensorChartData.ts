import { AppContext } from "../contexts/AppContext";
import { useContext, useEffect, useState } from "react";
import { SensorChartData } from "../components/SensorChart";

const SENSOR_GRAPHS_REFRESH_INTERVAL_MS = 5000;

export function useSensorChartData(): SensorChartData {
    const { isConnectedToDatabase } = useContext(AppContext);
    const [sensorChartData, setSensorChartData] = useState<SensorChartData>([]);

    if(!isConnectedToDatabase) return sensorChartData;

    // Laterss

    return sensorChartData;

}
