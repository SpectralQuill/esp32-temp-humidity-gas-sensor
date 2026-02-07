import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useConnection(
    checkConnection: () => Promise<boolean> | boolean,
    checkIntervalMs: number,
    checkSimulationsCount?: number,
): [boolean, Dispatch<SetStateAction<boolean>>] {
    const [isConnected, setIsConnected] = useState(false);
    const isSimulated: boolean = checkSimulationsCount !== undefined;

    async function handleCheck() {
        const intervalId = setInterval(async () => {
            const result = await checkConnection();
            setIsConnected(result);
        }, checkIntervalMs);
        return () => clearInterval(intervalId);
    }

    function simulateConnection() {
        const timeoutMs = checkIntervalMs * (checkSimulationsCount ?? 1);
        const timeoutId = setTimeout(() => setIsConnected(true), timeoutMs);
        return () => clearTimeout(timeoutId);
    }

    useEffect(() => {
        isSimulated ? simulateConnection() : handleCheck();
    }, [isSimulated]);

    return [isConnected, setIsConnected];
}
