import { ConnectionInformant } from "./ConnectionInformant";
import { MinuteRangeSelection } from "./MinuteRangeSelection";
import { SafetyLevelInformant } from "./SafetyLevelInformant";

import "../style/Header.scss";

export function Header() {

    return <>
        <header>
            <h1 className="font-large">ESP32 Sensor Dashboard</h1>
            <SafetyLevelInformant />
            <ConnectionInformant />
            <MinuteRangeSelection />
        </header>
    </>;

}
