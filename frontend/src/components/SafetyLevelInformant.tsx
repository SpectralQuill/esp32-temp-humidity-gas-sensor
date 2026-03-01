import { AppContext } from "../contexts/AppContext";
import { useContext } from "react";

export function SafetyLevelInformant() {

    const { generalSafetyLevel } = useContext(AppContext);

    const color = `#` + (generalSafetyLevel?.color ?? "a1a1a1");
    const label = generalSafetyLevel?.label ?? "Unknown";

    return <>
        <div className="level-informant-wrapper">
            <div className="level-informant font-medium" style={{
                background: color
            }}>
                {label}
            </div>
        </div>
    </>;

}
