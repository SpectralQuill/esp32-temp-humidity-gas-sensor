export class DateUtils {

    public static bucket(
        date: Date,
        intervalMs: number,
        offsetMs: number = 0
    ) {

        const dateMs: number = date.getTime();
        return Math.floor((dateMs - offsetMs) / intervalMs) * intervalMs + offsetMs;

    }

}
