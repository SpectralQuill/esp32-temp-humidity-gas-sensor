import { AppContext, AppContextProps } from "./contexts/AppContext";
// import { DangerPopup } from "./components/DangerPopup";
// import { Dashboard } from "./components/Dashboard";
import { EnvUtils } from "./utils/EnvUtils";
import { Esp32Api } from "./api/Esp32Api";
import { ESP32_FRONTEND_ENV_SCHEMA_DATA } from "./constants/envData";
import { format as formatDate } from "date-fns";
import {
    Fragment,
    useState
} from "react";
// import { Header } from "./components/Header";
// import { StartupPopup } from "./components/StartupPopup";
import { useApiConnection } from "./hooks/useApiConnection";
import { useDateRangeRefresher } from "./hooks/useDateRangeRefresher";
import { useSensorChartData } from "./hooks/useSensorChartData";
import { useSensorReadings } from "./hooks/useSensorReadings";
// import { VariableLogger } from "./components/VariableLogger";

import "./style/App.scss";

const DEFAULT_GRAPH_RANGE_MIN = 5;

export default function App() {

    const envMap = EnvUtils.ensureEnv(ESP32_FRONTEND_ENV_SCHEMA_DATA);
    const [api] = useState<Esp32Api>(new Esp32Api(
        envMap.VITE_API_HOST,
        envMap.VITE_API_PORT
    ));

    const [connectedToApi, connectingToApi] = useApiConnection(
        () => api.checkConnection(),
        envMap.VITE_API_CONNECTION_INTERVAL_MS,
        envMap.VITE_API_MAX_CONNECTION_COUNT,
        envMap.VITE_API_CONNECTION_IS_SIMULATED
    );
    const [graphRangeMin, setGraphRangeMin] = useState<number>(
        DEFAULT_GRAPH_RANGE_MIN
    );
    const dateRange = useDateRangeRefresher(
        envMap.VITE_CHART_REFRESH_INTERVAL_MS,
        graphRangeMin,
        connectedToApi
    );
    const sensorReadings = useSensorReadings(api, dateRange, connectedToApi);
    // const [sensorChartPoints, sensorChartAxisTicks] = useSensorChartData(
    //     sensorReadings,
    //     dateRange,
    //     envMap.VITE_CHART_POINTS_COUNT,
    //     connectedToApi
    // );
    const appContext: AppContextProps = {
        connectedToApi, connectingToApi,
        graphRangeMin, setGraphRangeMin,
        sensorChartPoints: [], sensorChartAxisTicks: []
    };

    return <AppContext.Provider value={appContext}>
        <table>
            <thead><tr>
                <td>Created at</td>
                <td>Temp</td>
                <td>Humidity</td>
                <td>Gas</td>
            </tr></thead>
            <tbody>
                {
                    sensorReadings.map((reading, index) => <Fragment key={index}>
                        <tr>
                            <td>{formatDate(reading.createdAt, "yyyy-MM-dd HH:mm:ss")}</td>
                            <td>{reading.temperatureC}</td>
                            <td>{reading.humidity}</td>
                            <td>{reading.gas}</td>
                        </tr>
                    </Fragment>)
                }
            </tbody>
        </table>
    </AppContext.Provider>;

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
