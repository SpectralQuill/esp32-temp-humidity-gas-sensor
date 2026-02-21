import { useEffect, useState } from "react";

export function useConnection(
    checkConnection: () => Promise<boolean> | boolean,
    checkIntervalMs: number,
    checkSimulationsCount?: number,
): boolean {
    const [isConnected, setIsConnected] = useState(false);
    const isSimulated: boolean = (checkSimulationsCount !== undefined);

    async function handleCheck() {

        const result = await checkConnection();
        setIsConnected(result);

    }

    function simulateConnection() {

        if (checkSimulationsCount === Infinity) return;
        const timeoutMs = checkIntervalMs * (checkSimulationsCount ?? 1);
        const timeoutId = setTimeout(() => setIsConnected(true), timeoutMs);
        return () => clearTimeout(timeoutId);

    }

    useEffect(() => {

        if(isSimulated) return simulateConnection();
        handleCheck();
        const intervalId = setInterval(async () => {
            const result = await checkConnection();
            setIsConnected(result);
            if(result) clearInterval(intervalId);
        }, checkIntervalMs);
        return () => clearInterval(intervalId);

    }, []);

    return isConnected;
}
