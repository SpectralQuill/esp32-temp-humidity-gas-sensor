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
    databaseAttemptSimulationsCount?: number;
    serialAttemptSimulationsCount?: number;
}

const CONNECTION_INTERVAL_MS: number = 1000;
const POPUP_CLOSE_TIMEOUT_MS: number = 1000;

export function StartupPopup(props: StartupPopupProps) {
    const { databaseAttemptSimulationsCount, serialAttemptSimulationsCount } =
        props;
    const isConnectedToDatabase = useConnection(
        connectToDatabase,
        CONNECTION_INTERVAL_MS,
        databaseAttemptSimulationsCount,
    );
    const isConnectedToSerial = useConnection(
        connectToSerial,
        CONNECTION_INTERVAL_MS,
        serialAttemptSimulationsCount,
    );
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!isConnectedToDatabase || !isConnectedToSerial) return;
        const timeoutId = setTimeout(
            () => setIsVisible(false),
            POPUP_CLOSE_TIMEOUT_MS,
        );
        return () => clearTimeout(timeoutId);
    }, [isConnectedToDatabase, isConnectedToSerial]);

    if (!isVisible) return <></>;

    return (
        <Popup
            className="startup-popup"
            visible={isVisible}
            isUnclosable={true}
        >
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
        </Popup>
    );
}

/** * A list item component that displays the connection status to a specific target with an appropriate icon and loading text.
 * @param isConnected - A boolean indicating whether the connection is established.
 * @param connectionTarget - A string representing the target of the connection (e.g., "database", "serial port").
 * @returns A JSX element representing the connection status list item.
 */
function ConnectionStatusListItem(props: ConnectionStatusListItemProps) {
    const { isConnected, connectionTarget } = props;
    const loadingText = useLoadingText();
    const icon = isConnected ? faSolidCircleCheck : faRegularCircleCheck;

    return (
        <li>
            <FontAwesomeIcon icon={icon} />
            {isConnected ? "Connected" : "Connecting"}
            <> to </>
            {connectionTarget}
            {isConnected || loadingText}
        </li>
    );
}

async function connectToDatabase(): Promise<boolean> {
    return false;
}

async function connectToSerial(): Promise<boolean> {
    return false;
}
