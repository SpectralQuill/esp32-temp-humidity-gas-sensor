import { ArrayUtils } from "../utils/ArrayUtils";
import { GeneralSafetyLevels } from "../constants/generalSafetyLevels";
import { SafetyLevelsMap } from "./useSafetyLevelsMap";
import { SensorReadingTypes } from "../constants/sensorReadingTypes";
import { useMemo } from "react";

export function useGeneralSafetyLevel(
    sensorReading: SensorReading | undefined,
    safetyLevelsMap: SafetyLevelsMap,
    active: boolean
): (SafetyLevel | undefined) {

    return useMemo<SafetyLevel | undefined>(() => {

        if (!sensorReading || !active) return; 
        const generalSafetyLevelIndex: GeneralSafetyLevels = Object.values(SensorReadingTypes)
            .reduce<GeneralSafetyLevels>((generalSafetyLevelIndex, readingType ) => {
                const value: number = sensorReading[readingType];
                const safetyLevels: SafetyLevel[] = safetyLevelsMap[readingType];
                const safetyLevelIndex: number = ArrayUtils.binarySearchIndex(
                    safetyLevels,
                    { threshold: value } as SafetyLevel,
                    compareSafetyLevels
                )
                const safetyLevel = safetyLevels[safetyLevelIndex];
                const newGeneralSafetyLevelIndex = (
                    safetyLevel ? GeneralSafetyLevels[safetyLevel.level]
                    : GeneralSafetyLevels.Unknown
                );
                return (
                    (newGeneralSafetyLevelIndex > generalSafetyLevelIndex) ?
                        newGeneralSafetyLevelIndex
                    : generalSafetyLevelIndex
                );
            }, GeneralSafetyLevels.Unknown)
        ;
        return safetyLevelsMap.general[generalSafetyLevelIndex];

    }, [sensorReading, safetyLevelsMap]);

}

export function compareSafetyLevels(
    a: SafetyLevel,
    b: SafetyLevel
): number {

    return a.threshold - b.threshold;

}
