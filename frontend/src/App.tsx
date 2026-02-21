import { AppContext, AppContextProps } from "./contexts/AppContext";
import { DangerPopup } from "./components/DangerPopup";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { SensorApi } from "./api/SensorApi";
import { StartupPopup } from "./components/StartupPopup";
import { useConnection } from "./hooks/useConnection";
import { useDateRangeRefresher } from "./hooks/useDateRangeRefresher";
import { useState } from "react";
import { useSensorChartData } from "./hooks/useSensorChartData";
import { VariableLogger } from "./components/VariableLogger";

import "./style/App.scss";

const DEFAULT_GRAPH_RANGE_BEFORE_MIN = 5;
const DATABASE_CONNECTION_SIMULATIONS_COUNT = undefined;
const CONNECTION_INTERVAL_MS: number = 1000;
const SENSOR_GRAPHS_REFRESH_INTERVAL_MS = 5000;

function App() {

    const [graphRangeMin, setGraphRangeMin] = useState<number>(
        DEFAULT_GRAPH_RANGE_BEFORE_MIN
    );
    const isConnectedToDatabase = useConnection(
        SensorApi.checkDatabaseConnection, 
        CONNECTION_INTERVAL_MS,
        DATABASE_CONNECTION_SIMULATIONS_COUNT
    );
    const [startDate, endDate] = useDateRangeRefresher(
        SENSOR_GRAPHS_REFRESH_INTERVAL_MS, graphRangeMin, isConnectedToDatabase
    );
    const [sensorChartData, sensorChartXTicks, generalSafetyLevel] = useSensorChartData(
        startDate, endDate, isConnectedToDatabase
    );
    const appContext: AppContextProps = {
        generalSafetyLevel,
        graphRangeMin, setGraphRangeMin,
        isConnectedToDatabase,
        sensorChartData, sensorChartXTicks
    }

    return (
        <AppContext.Provider value={appContext}>
            <>{/* Content */}
                <Header />
                <Dashboard />
            </>
            <>{/* Popups */}
                <StartupPopup />
                <DangerPopup visible={undefined} />
            </>
            <>{/* Variable loggers */}
                <VariableLogger variable={[startDate, endDate]} visible={false}>
                    Log Dates
                </VariableLogger>
                <VariableLogger variable={sensorChartData} visible={false}>
                    Log Sensor Data
                </VariableLogger>
            </>
        </AppContext.Provider>
    );
}

export default App;
