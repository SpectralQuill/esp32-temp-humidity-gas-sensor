import { AxisTick } from "recharts/types/util/types";
import { createContext } from "react";

export interface AppContextProps {
    connectedToApi: boolean; connectingToApi: boolean;
    graphRangeMin: number; setGraphRangeMin(rangeBeforeMin: number): void;
    sensorChartPoints: SensorChartPoint[]; sensorChartAxisTicks: AxisTick[];
}

export const AppContext = createContext<AppContextProps>({
    connectedToApi: false, connectingToApi: false,
    graphRangeMin: 5, setGraphRangeMin: () => {},
    sensorChartPoints: [], sensorChartAxisTicks: []
});
