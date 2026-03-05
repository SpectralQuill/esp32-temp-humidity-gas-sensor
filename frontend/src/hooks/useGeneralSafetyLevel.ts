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

        if (!active || !sensorReading) return;

        const generalSafetyLevelIndex: GeneralSafetyLevels = Object.values(SensorReadingTypes)
            .reduce<GeneralSafetyLevels>((generalSafetyLevelIndex, readingType) => {
                const safetyLevels: SafetyLevel[] = safetyLevelsMap[
                    readingType as SensorReadingType
                ];
                const value: number = sensorReading[readingType as SensorReadingType];
                const safetyLevel = getSafetyLevel(safetyLevels, value);
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

    }, [sensorReading, safetyLevelsMap, active]);

}

export function compareSafetyLevels(
    a: SafetyLevel,
    b: SafetyLevel
): number {

    return a.threshold - b.threshold + 0.01;

}

export function getSafetyLevel(
    safetyLevels: SafetyLevel[],
    value: number
): SafetyLevel {

    const index = ArrayUtils.binarySearchIndex(
        safetyLevels,
        { threshold: value } as SafetyLevel,
        compareSafetyLevels
    ) - 1;
    return safetyLevels[index];

}
