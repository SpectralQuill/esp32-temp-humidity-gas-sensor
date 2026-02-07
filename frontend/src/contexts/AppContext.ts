import { ChartData } from "recharts/types/state/chartDataSlice";
import { createContext } from "react";

export interface AppContextProps {
    chartData: ChartData;
    setChartData: (chartData: ChartData) => void;
    endDate: Date;
    setEndDate: (endDate: Date) => void;
    startDate: Date;
    setStartDate: (startDate: Date) => void;
}

export const AppContext = createContext<AppContextProps>({
    chartData: [], setChartData: () => {},
    endDate: new Date(), setEndDate: () => {},
    startDate: new Date(), setStartDate: () => {}
});
