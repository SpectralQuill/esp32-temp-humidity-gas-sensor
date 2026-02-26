export class DateRange {

    public constructor(
        private readonly startDate: Date,
        private readonly endDate: Date
    ) {

        if (startDate > endDate) throw new Error(
            "Error: startDate must be less than endDate"
        );

    }

}
