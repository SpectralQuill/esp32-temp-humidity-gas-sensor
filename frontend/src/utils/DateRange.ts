export class DateRange {

    public constructor(
        private readonly _startDate: Date,
        private readonly _endDate: Date
    ) {

        if (_startDate > _endDate) throw new Error(
            "Error: startDate must be less than endDate"
        );

    }

    public get endDate(): Date {

        return new Date(this._endDate);

    }

    public get startDate(): Date {

        return new Date(this._startDate);

    }

    public overlapsWithDateRange(
        dateRange: DateRange,
        excludeEndpoints: boolean = false
    ) {

        return excludeEndpoints ? (
            (this.endDate > dateRange.startDate)
            && (dateRange.endDate > this.startDate)
        ) : (
            (this.endDate >= dateRange.startDate)
            && (dateRange.endDate >= this.startDate)
        );

    }

    public toArray(): [Date, Date] {

        const { startDate, endDate } = this;
        return [startDate, endDate];

    }

}
