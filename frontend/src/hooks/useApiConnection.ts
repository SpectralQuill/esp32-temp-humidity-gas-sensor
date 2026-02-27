import { useCount } from "./useCount";
import {
    useEffect,
    useState
} from "react";

export function useApiConnection(
    connect: () => Promise<boolean> | boolean,
    connectionIntervalMs: number = 1000,
    maxConnectionAttempCount: number = Infinity,
    isSimulated: boolean = false
): [boolean, boolean] {

    const [connectionCount, addConnectionCount] = useCount();
    const [connected, setConnected] = useState<boolean>(false);

    const connecting: boolean = (connectionCount < maxConnectionAttempCount);

    useEffect(() => {

        const intervalId = setInterval(async () => {
            const connected: boolean = (
                !isSimulated ? (await connect())
                : (connectionCount >= maxConnectionAttempCount)
            );
            if (connected) {

                setConnected(true);
                clearInterval(intervalId);
                return;

            }
            addConnectionCount();
            if (connectionCount >= maxConnectionAttempCount)
                clearInterval(intervalId);
        }, connectionIntervalMs);

        return () => clearInterval(intervalId);

    }, []);

    return [connected, connecting];

}
