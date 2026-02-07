import { faCircleCheck as faSolidCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck as faRegularCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Popup } from "./Popup";
import { useState } from "react";

import "../style/StartupPopup.scss";

interface ConnectionStatusListItemProps {
    isConnected: boolean;
    connectionTarget: string;
}

export function StartupPopup() {

    const [isConnectedToDatabase, setIsConnectedToDatabase] = useState(false);
    const [isConnectedToSerial, setIsConnectedToSerial] = useState(false);
    const visible = !isConnectedToDatabase || !isConnectedToSerial;

    if (!visible) return <></>;

    return <Popup className="startup-popup" visible={visible} isUnclosable={false}>
        <h2>Welcome to the ESP32 Sensor Dashboard!</h2>
        <ul className="no-list-style font-medium">
            <ConnectionStatusListItem isConnected={isConnectedToDatabase} connectionTarget="database" />
            <ConnectionStatusListItem isConnected={isConnectedToSerial} connectionTarget="serial port" />
        </ul>
    </Popup>;
}

function ConnectionStatusListItem(props: ConnectionStatusListItemProps) {

    const { isConnected, connectionTarget } = props;
    const icon = isConnected ? faSolidCircleCheck : faRegularCircleCheck;

    return <li>
        <FontAwesomeIcon icon={icon}/>
        {isConnected ? "Connected" : "Connecting"}
        <> to </>
        {connectionTarget}
        {isConnected || "..."}
    </li>;
    
}
