import { AppContext } from "../contexts/AppContext";
import { ChangeEvent } from "react";
import { Fragment } from "react";
import { SENSOR_CHART_RANGES } from "../constants/sensorChartRangesData";
import { useContext } from "react";

export function GraphRangeSelection() {

    const { graphRangeMs, setGraphRangeMs } = useContext(AppContext);

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value: number = +event.target.value;
        setGraphRangeMs(value);
    };

    return <>
        <div className="graph-range-wrapper">
            <select
                id="graph-range"
                className="font-medium"
                value={graphRangeMs}
                onChange={handleChange}
            >
                {SENSOR_CHART_RANGES.map(
                    ({ label, rangeMs }) => <Fragment key={rangeMs}>
                        <option value={rangeMs}>{ label }</option>
                    </Fragment>
                )}
            </select>
        </div>
    </>;

}
