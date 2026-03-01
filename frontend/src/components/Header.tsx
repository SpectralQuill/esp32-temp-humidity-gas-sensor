import { ConnectionInformant } from "./ConnectionInformant";
import { GraphRangeSelection } from "./GraphRangeSelection";
import { SafetyLevelInformant } from "./SafetyLevelInformant";

import "../style/Header.scss";

export function Header() {

    return <>
        <header>
            <h1 className="font-large">ESP32 Sensor Dashboard</h1>
            <SafetyLevelInformant />
            <ConnectionInformant />
            <GraphRangeSelection />
        </header>
    </>;

}
