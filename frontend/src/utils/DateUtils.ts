export class DateUtils {

    public static bucket(
        date: Date,
        intervalMs: number,
        offsetMs: number = 0
    ): number {

        const dateMs: number = date.getTime();
        return Math.ceil((dateMs - offsetMs) / intervalMs) * intervalMs + offsetMs;

    }

}
