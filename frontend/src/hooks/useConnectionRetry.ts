import {
    useEffect,
    useState
} from "react";

/**
 * A hook for retrying connection to a service.
 * @param connect: A function for confirming connection to the service
 * @param retryIntervalMs: Number of milliseconds between connection attempts. Defaults to 1000.
 * @param maxRetryCount: Max count of connection attempts. Deafulats to Infinity.
 * @param isSimulated: Defaults to false. If true, after max retry counts connection will be successful. The connect() function will not be used.
 * @returns A tuple containing:
 * - [0] connected: Is true when connection is successful.
 * - [1] connecting: Is true when hook is still attempting to connect.
 * - [2] reconnect(): Marks connection as failed until connect() becomes successful again.
 */
export function useConnectionRetry(
    connect: () => Promise<boolean> | boolean,
    retryIntervalMs: number = 1000,
    maxRetryCount: number = Infinity,
    isSimulated: boolean = false
): [boolean, boolean, () => void] {

    const [retryCount, setRetryCount] = useState<number>(0);
    const [connected, setConnected] = useState<boolean>(false);

    const connecting: boolean = !connected && (retryCount < maxRetryCount);

    async function handleReconnect(): Promise<void> {

        setConnected(false);
        setRetryCount(0);

    }

    useEffect(() => {

        if (connected) return;
        let cancelled = false;
        const handleConnect = async () => {
            if (cancelled) return;
            setRetryCount(
                retryCount => (retryCount >= maxRetryCount) ? retryCount : retryCount + 1
            );
            const result = !isSimulated ? await connect() : false;
            if (cancelled) return;
            if (result) {
                setConnected(true);
                return;
            }
            if (retryCount < maxRetryCount) setTimeout(handleConnect, retryIntervalMs);
        };
        handleConnect();
        return () => { cancelled = true; };

    }, [connect, maxRetryCount, retryIntervalMs, isSimulated]);

    return [connected, connecting, handleReconnect];

}
