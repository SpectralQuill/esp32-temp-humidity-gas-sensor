import { DateRange } from "../utils/DateRange";
import { subMinutes } from "date-fns";
import { useEffect, useState } from "react";

export function useDateRangeRefresher(
    refreshIntervalMs: number,
    rangeBeforeMin: number,
    active: boolean
): DateRange {

    const now = new Date();
    const past = subMinutes(now, rangeBeforeMin);

    const [startDate, setStartDate] = useState<Date>(past);
    const [endDate, setEndDate] = useState<Date>(now);

    function handeUpdate(): void {

        const now = new Date();
        const past = subMinutes(now, rangeBeforeMin);
        setStartDate(past);
        setEndDate(now);

    }

    useEffect(() => {

        if(!active) return;
        handeUpdate();
        const intervalId = setInterval(handeUpdate, refreshIntervalMs);
        return () => clearInterval(intervalId);

    }, [refreshIntervalMs, rangeBeforeMin, active]);

    return new DateRange(startDate, endDate);

}
