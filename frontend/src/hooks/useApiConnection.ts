import { Esp32Api } from "../api/Esp32Api";
import {
    useEffect,
    useState
} from "react";

export const FAILED_SIMULATED_API_HEALTH = {
    status: "unhealthy",
    databaseStatus: "unreachable"
} as const;

export const SUCCESS_SIMULATED_API_HEALTH = {
    status: "healthy",
    databaseStatus: "reachable"
} as const;

export function useApiConnection(
    api: Esp32Api,
    connectionIntervalMs: number = 1000,
    maxConnectionAttempCount: number = Infinity,
    isSimulated: boolean = false
): [boolean, boolean] {

    const [connectionCount, setConnectionCount] = useState<number>(0);
    const [connected, setConnected] = useState<boolean>(false);

    const active: boolean = (connectionCount < maxConnectionAttempCount);

    useEffect(() => {

        const intervalId = setInterval(async () => {
            const { status, databaseStatus } = (
                !isSimulated ? (await api.getHealth())
                : (connectionCount < maxConnectionAttempCount) ?
                    FAILED_SIMULATED_API_HEALTH
                : SUCCESS_SIMULATED_API_HEALTH
            );
            const isHealthy = (
                (status === "healthy") && (databaseStatus === "reachable")
            );
            if (isHealthy) {

                setConnected(true);
                clearInterval(intervalId);
                return;

            }
            setConnectionCount(connectionCount + 1);
            if (connectionCount >= maxConnectionAttempCount)
                clearInterval(intervalId);
        }, connectionIntervalMs);

        return () => clearInterval(intervalId);

    }, []);

    return [connected, active];

}
