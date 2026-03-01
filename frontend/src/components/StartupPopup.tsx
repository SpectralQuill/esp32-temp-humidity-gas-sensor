import { AppContext } from "../contexts/AppContext";
import { faCircleCheck as faSolidCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck as faRegularCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Popup } from "./Popup";
import { useLoadingText } from "../hooks/useLoadingText";
import { useContext, useEffect, useState } from "react";

import "../style/StartupPopup.scss";

const POPUP_CLOSE_TIMEOUT_MS: number = 1000;

export function StartupPopup() {

    const { connectedToApi } = useContext(AppContext);
    const [isVisible, setIsVisible] = useState(true);
    const loadingText = useLoadingText();

    useEffect(() => {
        if (!connectedToApi) return;
        const timeoutId = setTimeout(() => setIsVisible(false), POPUP_CLOSE_TIMEOUT_MS);
        return () => clearTimeout(timeoutId);
    }, [connectedToApi]);

    if (!isVisible) return <></>;

    return <>
        <Popup
            className="startup-popup"
            visible={isVisible}
            isUnclosable={true}
        >
            <h2>Welcome to the ESP32 Sensor Dashboard!</h2>
            <ul className="progress no-list-style font-medium">
                <li>
                    <FontAwesomeIcon icon={
                        connectedToApi ? faSolidCircleCheck : faRegularCircleCheck
                    } />
                    {connectedToApi ? "Connected" : "Connecting"}
                    <> to database</>
                    {connectedToApi || loadingText}
                </li>
            </ul>
        </Popup>
    </>;
    
}
