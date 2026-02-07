import { faCircleCheck as faSolidCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck as faRegularCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Popup } from "./Popup";
import { useConnection } from "../hooks/useConnection";
import { useLoadingText } from "../hooks/useLoadingText";
import { useEffect, useState } from "react";

import "../style/StartupPopup.scss";

interface ConnectionStatusListItemProps {
    isConnected: boolean;
    connectionTarget: string;
}

interface StartupPopupProps {
    simulateDatabaseConnection?: boolean;
    simulateSerialConnection?: boolean;
}

const CONNECTION_INTERVAL_MS: number = 1000;
const CONNECTION_SIMULATION_ATTEMPTS: number = 3;
const SUCCESS_CONNECTION_TIMEOUT_MS: number = 1000;

export function StartupPopup(props: StartupPopupProps) {

    const isConnectedToDatabase = useConnection(
        connectToDatabase,
        CONNECTION_INTERVAL_MS,
        props.simulateDatabaseConnection ? CONNECTION_SIMULATION_ATTEMPTS : undefined
    );
    const isConnectedToSerial = useConnection(
        connectToSerial,
        CONNECTION_INTERVAL_MS,
        props.simulateSerialConnection ? CONNECTION_SIMULATION_ATTEMPTS : undefined
    );
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {

        if (!isConnectedToDatabase || !isConnectedToSerial) return;
        const timeoutId = setTimeout(() => setIsVisible(false), SUCCESS_CONNECTION_TIMEOUT_MS);
        return () => clearTimeout(timeoutId);

    }, [isConnectedToDatabase, isConnectedToSerial]);

    if (!isVisible) return <></>;

    return <Popup className="startup-popup" visible={isVisible} isUnclosable={true}>
        <h2>Welcome to the ESP32 Sensor Dashboard!</h2>
        <ul className="no-list-style font-medium">
            <ConnectionStatusListItem
                isConnected={isConnectedToDatabase}
                connectionTarget="database"
            />
            <ConnectionStatusListItem
                isConnected={isConnectedToSerial}
                connectionTarget="serial port"
            />
        </ul>
    </Popup>;
}

function ConnectionStatusListItem(props: ConnectionStatusListItemProps) {

    const { isConnected, connectionTarget } = props;
    const loadingText = useLoadingText();
    const icon = isConnected ? faSolidCircleCheck : faRegularCircleCheck;

    return <li>
        <FontAwesomeIcon icon={icon}/>
        {isConnected ? "Connected" : "Connecting"}
        <> to </>
        {connectionTarget}
        {isConnected || loadingText}
    </li>;
    
}

async function connectToDatabase(): Promise<boolean> {
    return false;
}

async function connectToSerial(): Promise<boolean> {
    return false;
}
