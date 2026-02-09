import { AxisTick } from "recharts/types/util/types";
import { createContext } from "react";
import {
    GeneralSafetyLevelProps,
    GENERAL_SAFETY_LEVELS
} from "../constants/safetyLevels";

export interface AppContextProps {
    generalSafetyLevel: GeneralSafetyLevelProps;
    graphRangeMin: number; setGraphRangeMin(rangeBeforeMin: number): void;
    isConnectedToDatabase: boolean;
    sensorChartData: SensorChartData;
    sensorChartXTicks: AxisTick[];
}

export const AppContext = createContext<AppContextProps>({
    generalSafetyLevel: GENERAL_SAFETY_LEVELS[0],
    graphRangeMin: 30, setGraphRangeMin: () => {},
    isConnectedToDatabase: false,
    sensorChartData: [],
    sensorChartXTicks: []
});
