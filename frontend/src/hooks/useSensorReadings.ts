import { DateRange } from "../utils/DateRange";
import { Esp32Api } from "../services/Esp32Api";
import {
    useEffect,
    useRef,
    useState
} from "react";

export function useSensorReadings(
    api: Esp32Api,
    dateRange: DateRange,
    active: boolean,
    reconnectToApi: () => void
): SensorReading[] {

    const sensorReadingsRef = useRef<SensorReading[]>([]);
    const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
    const requestIdRef = useRef<number>(0);

    useEffect(() => {

        if (!active) return;
        let cancelled = false;
        const handleUpdate = async () => {
            const requestId = ++requestIdRef.current;
            if (cancelled) return;
            try {

                const readings = await api.getReadings(...dateRange.toArray());
                if (cancelled || requestIdRef.current !== requestId) return;
                sensorReadingsRef.current = readings;
                if (cancelled || requestIdRef.current !== requestId) return;
                setSensorReadings([...sensorReadingsRef.current]);

            } catch {

                reconnectToApi();

            }
        };
        handleUpdate();

        return () => { cancelled = true; };

    }, [api, dateRange, active]);

    return sensorReadings;

}
