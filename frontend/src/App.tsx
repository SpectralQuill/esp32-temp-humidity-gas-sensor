import { AppContext, AppContextProps } from "./contexts/AppContext";
import { DangerPopup } from "./components/DangerPopup";
import { Dashboard } from "./components/Dashboard";
import { EnvUtils } from "./utils/EnvUtils";
import { Esp32Api } from "./services/Esp32Api";
import { ESP32_FRONTEND_ENV_SCHEMA_DATA } from "./constants/envData";
import { minutesToMilliseconds } from "date-fns";
import {
    useRef,
    useState
} from "react";
import { Header } from "./components/Header";
import { StartupPopup } from "./components/StartupPopup";
import {
    useCallback,
    useMemo
} from "react";
import { useConnectionRetry } from "./hooks/useConnectionRetry";
import { useEsp32ConnectionConfirmation } from "./hooks/useEsp32ConnectionConfirmation";
import { useGeneralSafetyLevel } from "./hooks/useGeneralSafetyLevel";
import { useSafetyLevelsMap } from "./hooks/useSafetyLevelsMap";
import { useSensorChartData } from "./hooks/useSensorChartData";
import { useSensorChartRange } from "./hooks/useSensorChartRange";
import { useSensorReadings } from "./hooks/useSensorReadings";
import { useSlidingDateRange } from "./hooks/useSlidingDateRange";
import { VariableLogger } from "./components/VariableLogger";

import "./style/App.scss";

const DEFAULT_GRAPH_RANGE_MS = minutesToMilliseconds(1);

export default function App() {

    const { current: envMap } = useRef(EnvUtils.ensureEnv(ESP32_FRONTEND_ENV_SCHEMA_DATA));
    const { current: api } = useRef(new Esp32Api(
        envMap.VITE_API_HOST,
        envMap.VITE_API_PORT
    ));
    const connect = useCallback(() => api.checkConnection(), [api]);

    const [connectedToApi, connectingToApi, reconnectToApi] = useConnectionRetry(
        connect,
        envMap.VITE_API_RETRY_INTERVAL_MS,
        envMap.VITE_API_MAX_RETRY_COUNT,
        envMap.VITE_API_CONNECTION_IS_SIMULATED
    );
    const [graphRangeMs, setGraphRangeMs] = useState<number>(DEFAULT_GRAPH_RANGE_MS);
    const dateRange = useSlidingDateRange(
        envMap.VITE_CHART_REFRESH_INTERVAL_MS,
        graphRangeMs,
        connectedToApi
    );
    const sensorChartRange = useSensorChartRange(dateRange, connectedToApi);
    const sensorReadings = useSensorReadings(
        api,
        dateRange,
        sensorChartRange,
        connectedToApi,
        reconnectToApi
    );
    const connectedToEsp32 = useEsp32ConnectionConfirmation(
        sensorReadings,
        dateRange,
        envMap.VITE_CHART_REFRESH_INTERVAL_MS,
        1.5 * envMap.VITE_CHART_REFRESH_INTERVAL_MS
    );
    const [sensorChartPoints, sensorChartAxisTicks] = useSensorChartData(
        sensorReadings,
        dateRange,
        sensorChartRange,
        connectedToApi
    );
    const safetyLevelsMap = useSafetyLevelsMap(api, connectedToApi, reconnectToApi);
    const generalSafetyLevel = useGeneralSafetyLevel(
        sensorReadings[sensorReadings.length - 1],
        safetyLevelsMap,
        connectedToApi
    );
    const appContext = useMemo<AppContextProps>(() =>({
        connectedToApi, connectingToApi,
        connectedToEsp32,
        generalSafetyLevel,
        graphRangeMs, setGraphRangeMs,
        safetyLevelsMap,
        sensorChartPoints, sensorChartAxisTicks
    }), [
        connectedToApi, connectingToApi, connectedToEsp32, dateRange, generalSafetyLevel,
        safetyLevelsMap, sensorChartPoints, sensorChartAxisTicks
    ]);

    return <AppContext.Provider value={appContext}>
        <>{/* Content */}
            <Header />
            <Dashboard />
        </>
        <>{/* Popups */}
            <StartupPopup />
            <DangerPopup visible={undefined} />
        </>
        <>{/* Variable loggers */}
            {/* <h4>{sensorReadings.length}</h4> */}
            <VariableLogger variable={dateRange} visible={false}>
                Log Dates
            </VariableLogger>
            <VariableLogger variable={sensorChartPoints} visible={false}>
                Log Sensor Chart Points
            </VariableLogger>
        </>
    </AppContext.Provider>;
}
