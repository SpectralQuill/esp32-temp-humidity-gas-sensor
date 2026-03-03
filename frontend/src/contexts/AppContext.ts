import { AxisTick } from "recharts/types/util/types";
import { createContext } from "react";
import { SafetyLevelsMap } from "../hooks/useSafetyLevelsMap";

export interface AppContextProps {
    connectedToApi: boolean; connectingToApi: boolean;
    connectedToEsp32: boolean;
    generalSafetyLevel?: SafetyLevel;
    graphRangeMs: number; setGraphRangeMs(rangeBeforeMin: number): void;
    safetyLevelsMap: SafetyLevelsMap;
    sensorChartPoints: SensorChartPoint[]; sensorChartAxisTicks: AxisTick[];
}

export const AppContext = createContext<AppContextProps>({
    connectedToApi: false, connectingToApi: false,
    connectedToEsp32: false,
    graphRangeMs: 5, setGraphRangeMs: () => {},
    safetyLevelsMap: {} as SafetyLevelsMap,
    sensorChartPoints: [], sensorChartAxisTicks: []
});
