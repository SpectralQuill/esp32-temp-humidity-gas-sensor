import { subMinutes } from "date-fns";
import { useEffect, useState } from "react";

export function useDateRangeRefresher(
    refreshIntervalMs: number,
    rangeBeforeMin: number,
    active: boolean
): [Date, Date] {

    const now = new Date();
    const past = subMinutes(now, rangeBeforeMin);

    const [endDate, setEndDate] = useState<Date>(now);
    const [startDate, setStartDate] = useState<Date>(past);

    async function handeUpdate(): Promise<void> {

        const now = new Date();
        const past = subMinutes(now, rangeBeforeMin);
        setStartDate(past);
        setEndDate(now);

    }

    useEffect(() => {

        if(!active) return;
        handeUpdate();
        const intervalId = setInterval(async () => {
            await handeUpdate();
        }, refreshIntervalMs);
        return () => clearInterval(intervalId);

    }, [refreshIntervalMs, rangeBeforeMin, active]);

    return [startDate, endDate];

}
