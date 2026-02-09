/*
* difference: [tick minutes interval, point minutes interval]
*/
export const TICK_POINT_MIN_INTERVAL_MAP: {
    [difference: number]: [number, number]
} = {
    1: [1, 1/60],
    5: [1, 10/60],
    30: [5, 1],
    60: [10, 1],
    360: [30, 10],
    1440: [60, 20],
    Infinity: [1440, 720]
}
