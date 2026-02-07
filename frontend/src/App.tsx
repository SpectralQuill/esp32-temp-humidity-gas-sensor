import { AppContext, AppContextProps } from "./contexts/AppContext";
import { checkDatabaseConnection } from "./api/check-database-connection";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { StartupPopup } from "./components/StartupPopup";
import { subMinutes } from "date-fns";
import { useConnection } from "./hooks/useConnection";
import { useMemo, useState } from "react";
import { useSensorChartData } from "./hooks/useSensorChartData";
import { VariableLogger } from "./components/VariableLogger";

import "./style/App.scss";

const DATABASE_CONNECTION_SIMULATIONS_COUNT = 3;

const CONNECTION_INTERVAL_MS: number = 1000;

function App() {

    const now =  new Date();
    const past30Min = subMinutes(now, 30);

    const [endDate, setEndDate] = useState<Date>(now);
    const [isConnectedToDatabase, setIsConnectedToDatabase] = useConnection(
        checkDatabaseConnection, CONNECTION_INTERVAL_MS, DATABASE_CONNECTION_SIMULATIONS_COUNT
    );
    const sensorChartData = useSensorChartData();
    const [startDate, setStartDate] = useState<Date>(past30Min);

    const appContext = useMemo<AppContextProps>(() => ({
        endDate, setEndDate,
        isConnectedToDatabase, setIsConnectedToDatabase,
        sensorChartData,
        startDate, setStartDate
    }), [
        endDate, isConnectedToDatabase, sensorChartData, startDate
    ]);

    return (
        <AppContext.Provider value={appContext}>
            <>
                <VariableLogger variable={[startDate, endDate]} visible={false}>
                    Log Dates
                </VariableLogger>
            </>
            <p>{isConnectedToDatabase ? "Connected" : "Waiting for connection"}</p>
            <StartupPopup />
            <Header />
            <Dashboard />
        </AppContext.Provider>
    );
}

export default App;
