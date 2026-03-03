import { AppContext } from "../contexts/AppContext";
import { hexColor } from "../taggedTemplates/hexColor";
import { useContext, useEffect, useState } from "react";

export function ConnectionInformant() {

    const { connectedToApi } = useContext(AppContext);
    const [label, setLabel] = useState<string>("Not connected");
    const [color, setColor] = useState<string>("#a1a1a1");
    
    useEffect(() => {

        setLabel(connectedToApi ? "Connected" : "Not connected");
        setColor(connectedToApi ? "#4caf50" : "#a1a1a1");

    }, [connectedToApi]);

    return <>
        <div className="connection-informant-wrapper">
            <div className="connection-informant font-medium" style={{
                background: hexColor`${color}`
            }}>
                {label}
            </div>
        </div>
    </>;

}
