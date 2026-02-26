// import { AppContext, AppContextProps } from "./contexts/AppContext";
// import { DangerPopup } from "./components/DangerPopup";
// import { Dashboard } from "./components/Dashboard";
import { EnvUtils } from "./utils/EnvUtils";
import { Esp32Api } from "./api/Esp32Api";
import { ESP32_FRONTEND_ENV_SCHEMA_DATA } from "./constants/envData";
// import { Header } from "./components/Header";
// import { StartupPopup } from "./components/StartupPopup";
import { useApiConnection } from "./hooks/useApiConnection";
import { useNowDateRangeRefresher } from "./hooks/useNowDateRangeRefresher";
// import { useState } from "react";
// import { useSensorChartData } from "./hooks/useSensorChartData";
// import { VariableLogger } from "./components/VariableLogger";

import "./style/App.scss";

const DEFAULT_GRAPH_RANGE_BEFORE_MIN = 5;

function App() {

    const {
        VITE_API_HOST, VITE_API_PORT, VITE_API_CONNECTION_INTERVAL_MS,
        VITE_API_MAX_CONNECTION_COUNT, VITE_API_CONNECTION_IS_SIMULATED,
        VITE_GRAPH_REFRESH_INTERVAL_MS
    } = EnvUtils.ensureEnv(ESP32_FRONTEND_ENV_SCHEMA_DATA);
    const api = new Esp32Api(VITE_API_HOST, VITE_API_PORT);

    const [isConnectedToApi, isAttemptingConnectionToApi] = useApiConnection(
        api, VITE_API_CONNECTION_INTERVAL_MS, VITE_API_MAX_CONNECTION_COUNT,
        VITE_API_CONNECTION_IS_SIMULATED
    );
    const [startDate, endDate] = useNowDateRangeRefresher(
        VITE_GRAPH_REFRESH_INTERVAL_MS, DEFAULT_GRAPH_RANGE_BEFORE_MIN,
        isConnectedToApi
    );

    return <h1>efe</h1>

    // const [graphRangeMin, setGraphRangeMin] = useState<number>(
    //     DEFAULT_GRAPH_RANGE_BEFORE_MIN
    // );
    // const isConnectedToDatabase = useConnection(
    //     SensorApi.checkDatabaseConnection, 
    //     CONNECTION_INTERVAL_MS,
    //     DATABASE_CONNECTION_SIMULATIONS_COUNT
    // );
    // const [startDate, endDate] = useDateRangeRefresher(
    //     SENSOR_GRAPHS_REFRESH_INTERVAL_MS, graphRangeMin, isConnectedToDatabase
    // );
    // const [sensorChartData, sensorChartXTicks, generalSafetyLevel] = useSensorChartData(
    //     startDate, endDate, isConnectedToDatabase
    // );
    // const appContext: AppContextProps = {
    //     generalSafetyLevel,
    //     graphRangeMin, setGraphRangeMin,
    //     isConnectedToDatabase,
    //     sensorChartData, sensorChartXTicks
    // }

    // return (
    //     <AppContext.Provider value={appContext}>
    //         <>{/* Content */}
    //             <Header />
    //             <Dashboard />
    //         </>
    //         <>{/* Popups */}
    //             <StartupPopup />
    //             <DangerPopup visible={undefined} />
    //         </>
    //         <>{/* Variable loggers */}
    //             <VariableLogger variable={[startDate, endDate]} visible={false}>
    //                 Log Dates
    //             </VariableLogger>
    //             <VariableLogger variable={sensorChartData} visible={false}>
    //                 Log Sensor Data
    //             </VariableLogger>
    //         </>
    //     </AppContext.Provider>
    // );
}

export default App;
