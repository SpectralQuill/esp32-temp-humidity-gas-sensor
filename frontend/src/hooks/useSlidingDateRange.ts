import { DateRange } from "../utils/DateRange";
import { subMilliseconds } from "date-fns";
import {
    useEffect,
    useState
} from "react";

export function useSlidingDateRange(
    refreshIntervalMs: number,
    rangeMs: number,
    active: boolean
): DateRange {

    const [dateRange, setDateRange] = useState<DateRange>(
        () => getCurrentDateRange(rangeMs)
    );

    useEffect(() => {

        if(!active) return;
        let cancelled = false;
        const handleUpdate = () => {
            if (cancelled) return;
            setDateRange(getCurrentDateRange(rangeMs));
            setTimeout(handleUpdate, refreshIntervalMs);
        };
        handleUpdate();
        return () => { cancelled = true; };

    }, [refreshIntervalMs, rangeMs, active]);

    return dateRange;

}

export function getCurrentDateRange(rangeMs: number): DateRange {

    const now = new Date();
    const past = subMilliseconds(now, rangeMs);
    return new DateRange(past, now);

}
