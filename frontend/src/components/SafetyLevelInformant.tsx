import { AppContext } from "../contexts/AppContext";
import { useContext } from "react";

export function SafetyLevelInformant() {
    const {
        generalSafetyLevel: { color, label }
    } = useContext(AppContext);

    return (
        <>
            <div className="level-informant-wrapper">
                <div className="level-informant font-medium" style={{
                    background: color
                }}>
                    {label}
                </div>
            </div>
        </>
    );
}
