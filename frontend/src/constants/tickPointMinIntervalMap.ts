/*
* difference: [tick minutes interval, point minutes interval]
*/
export const TICK_POINT_MIN_INTERVAL_MAP: {
    [difference: number]: [number, number, string]
} = {
    1: [1, 1/60, "1 minute"],
    5: [1, 10/60, "5 minutes"],
    30: [5, 1, "30 minutes"],
    60: [10, 1, "1 hour"],
    360: [30, 10, "6 hours"],
    1440: [60, 30, "1 day"]
}
