import { Esp32Api } from "../services/Esp32Api";
import { SafetyLevelReadingTypes } from "../constants/safetyLevelReadingTypes";
import {
    useEffect,
    useRef,
    useState
} from "react";

export interface SafetyLevelsMap {
    temperatureC: SafetyLevel[],
    humidity: SafetyLevel[],
    gas: SafetyLevel[],
    general: SafetyLevel[]
}

export const SAFETY_LEVELS_MAP_TEMPLATE = {
    temperatureC: [],
    humidity: [],
    gas: [],
    general: []
} as const satisfies SafetyLevelsMap;

export function useSafetyLevelsMap(
    api: Esp32Api,
    active: boolean,
    reconnect: () => void
): SafetyLevelsMap {

    const [safetyLevelsMap, setSafetyLevelsMap] = useState<SafetyLevelsMap>({
        ...SAFETY_LEVELS_MAP_TEMPLATE
    });
    const requestIdRef = useRef<number>(1);

    useEffect(() => {

        if (!active) return;
        let cancelled = false;
        const handleUpdate = async () => {

            const requestId = ++requestIdRef.current;
            if (cancelled) return;
            try {

                const safetyLevelsArray = await Promise.all(
                    Object.values(SafetyLevelReadingTypes).map(
                        (readingType: SafetyLevelReadingType) => api.getSafetyLevels(
                            readingType
                        )
                    )
                );
                if (requestIdRef.current !== requestId || cancelled) return;
                setSafetyLevelsMap({
                    temperatureC: safetyLevelsArray[0],
                    humidity: safetyLevelsArray[1],
                    gas: safetyLevelsArray[2],
                    general: safetyLevelsArray[3]
                });

            } catch {

                const safetyLevelsArray: SafetyLevel[][] = Object.values(safetyLevelsMap)
                if (safetyLevelsArray.some(safetyLevels => safetyLevels.length > 0))
                    setSafetyLevelsMap({ ...SAFETY_LEVELS_MAP_TEMPLATE });

            }

        };

        try {

            handleUpdate();
        
        } catch {

            reconnect();

        }

        return () => { cancelled = true; };

    }, [api, active]);

    return safetyLevelsMap;

}
