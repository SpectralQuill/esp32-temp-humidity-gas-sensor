import { AppContext } from "../contexts/AppContext";
import { MinuteRangeSelection } from "./MinuteRangeSelection";
import { useContext } from "react";

import "../style/Header.scss";

export function Header() {
    return (
        <>
            <header>
                <h1 className="font-large">ESP32 Sensor Dashboard</h1>
                <LevelInformant />
                <MinuteRangeSelection />
            </header>
        </>
    );
}

function LevelInformant() {
    const {
        generalSafetyLevel
    } = useContext(AppContext);

    return (
        <>
            <div className="level-informant font-large">
                <>-Color: </>
                {generalSafetyLevel.color},{generalSafetyLevel.label}
            </div>
        </>
    );
}
