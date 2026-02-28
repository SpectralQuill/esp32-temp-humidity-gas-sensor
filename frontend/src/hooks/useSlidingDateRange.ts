import { DateRange } from "../utils/DateRange";
import { subMinutes } from "date-fns";
import {
    useEffect,
    useState
} from "react";

export function useSlidingDateRange(
    refreshIntervalMs: number,
    durationMin: number,
    active: boolean
): DateRange {

    const [dateRange, setDateRange] = useState<DateRange>(
        () => getCurrentDateRange(durationMin)
    );

    useEffect(() => {

        if(!active) return;
        let cancelled = false;
        const handleUpdate = () => {
            if (cancelled) return;
            setDateRange(getCurrentDateRange(durationMin));
            setTimeout(handleUpdate, refreshIntervalMs);
        };
        handleUpdate();
        return () => { cancelled = true; };

    }, [refreshIntervalMs, durationMin, active]);

    return dateRange;

}

export function getCurrentDateRange(durationMin: number): DateRange {

    const now = new Date();
    const past = subMinutes(now, durationMin);
    return new DateRange(past, now);

}
