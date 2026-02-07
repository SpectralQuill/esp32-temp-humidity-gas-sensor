import { AppContext, AppContextProps } from "./contexts/AppContext";
import { ChartData } from "recharts/types/state/chartDataSlice";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { StartupPopup } from "./components/StartupPopup";
import { subMinutes } from "date-fns";
import { useState } from "react";
import { VariableLogger } from "./components/VariableLogger";

import "./style/App.scss";

const DATABASE_ATTEMPT_SIMULATIONS_COUNT = 2;
const SERIAL_ATTEMPT_SIMULATIONS_COUNT = 4;

function App() {

    const now =  new Date();
    const past30Min = subMinutes(now, 30);

    const [chartData, setChartData] = useState<ChartData>([]);
    const [endDate, setEndDate] = useState<Date>(now);
    const [startDate, setStartDate] = useState<Date>(past30Min);

    const [appContext] = useState<AppContextProps>({
        chartData, setChartData,
        endDate, setEndDate,
        startDate, setStartDate
    });

    return (
        <AppContext.Provider value={appContext}>
            <>
                <VariableLogger variable={[startDate, endDate]} visible={false}>
                    Log Dates
                </VariableLogger>
            </>
            <StartupPopup
                databaseAttemptSimulationsCount={
                    DATABASE_ATTEMPT_SIMULATIONS_COUNT
                }
                serialAttemptSimulationsCount={SERIAL_ATTEMPT_SIMULATIONS_COUNT}
            />
            <Header />
            <Dashboard />
        </AppContext.Provider>
    );
}

export default App;
