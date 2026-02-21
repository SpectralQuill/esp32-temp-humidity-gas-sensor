import { AppContext } from "../contexts/AppContext";
import { useContext, useEffect, useState } from "react";

export function ConnectionInformant() {

    const { isConnectedToDatabase } = useContext(AppContext);
    const [label, setLabel] = useState<string>("Not connected");
    const [color, setColor] = useState<string>("#a1a1a1");
    
    useEffect(() => {

        setLabel(isConnectedToDatabase ? "Connected" : "Not connected");
        setColor(isConnectedToDatabase ? "#4caf50" : "#a1a1a1");

    }, [isConnectedToDatabase]);

    return (
        <>
            <div className="connection-informant-wrapper">
                <div className="connection-informant font-medium" style={{
                    background: color
                }}>
                    {label}
                </div>
            </div>
        </>
    );
}
