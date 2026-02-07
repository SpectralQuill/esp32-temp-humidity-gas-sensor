import { useEffect, useState } from "react";

/**
 * Custom React hook for managing connection status.
 * @param connect - A function that attempts to establish a connection and returns a boolean indicating success.
 * @param attemptIntervalMs - The interval in milliseconds between connection attempts.
 * @param attemptSimulationsCount - Optional number of simulated connection attempts before considering the connection successful.
 * @returns A boolean indicating whether the connection is established.
 */
export function useConnection(
    connect: () => Promise<boolean> | boolean,
    attemptIntervalMs: number,
    attemptSimulationsCount?: number,
): boolean {
    const [isConnected, setIsConnected] = useState(false);
    const isSimulated: boolean = attemptSimulationsCount !== undefined;

    async function attemptConnection() {
        const intervalId = setInterval(async () => {
            const result = await connect();
            setIsConnected(result);
        }, attemptIntervalMs);
        return () => clearInterval(intervalId);
    }

    function simulateConnection() {
        const timeoutMs = attemptIntervalMs * (attemptSimulationsCount ?? 1);
        const timeoutId = setTimeout(() => setIsConnected(true), timeoutMs);
        return () => clearTimeout(timeoutId);
    }

    useEffect(() => {
        isSimulated ? simulateConnection() : attemptConnection();
    }, [isSimulated]);

    return isConnected;
}
