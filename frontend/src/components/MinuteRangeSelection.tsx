import { AppContext } from "../contexts/AppContext";
import { ChangeEvent } from "react";
import { Fragment } from "react";
import { TICK_POINT_MIN_INTERVAL_MAP } from "../constants/tickPointMinIntervalMap";
import { useContext } from "react";

export function MinuteRangeSelection() {

    const { graphRangeMin, setGraphRangeMin } = useContext(AppContext);

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value: number = +event.target.value;
        setGraphRangeMin(value);
    };

    return <>
        <div className="graph-range-wrapper">
            <select
                id="graph-range"
                className="font-medium"
                value={graphRangeMin}
                onChange={handleChange}
            >
                {Object.entries(TICK_POINT_MIN_INTERVAL_MAP).map(
                    ([value, [_1, _2, label]]) => <Fragment key={value}>
                        <option value={+value}>{ label }</option>
                    </Fragment>
                )}
            </select>
        </div>
    </>;

}
