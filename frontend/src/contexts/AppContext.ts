import { createContext } from "react";
import { SensorChartData } from "../components/SensorChart";

export interface AppContextProps {
    sensorChartData: SensorChartData;
    endDate: Date;
    setEndDate: (endDate: Date) => void;
    isConnectedToDatabase: boolean;
    setIsConnectedToDatabase: (isConnected: boolean) => void;
    startDate: Date;
    setStartDate: (startDate: Date) => void;
}

export const AppContext = createContext<AppContextProps>({
    sensorChartData: [],
    endDate: new Date(), setEndDate: () => {},
    isConnectedToDatabase: false, setIsConnectedToDatabase: () => {},
    startDate: new Date(), setStartDate: () => {}
});
