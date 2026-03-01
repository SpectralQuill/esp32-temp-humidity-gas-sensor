import { AppContext } from "../contexts/AppContext";
import { ArrayUtils } from "../utils/ArrayUtils";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Popup } from "./Popup";
import { useContext, useEffect, useState } from "react";

import "../style/DangerPopup.scss";

interface DangerPopupProps {
    className?: string;
    visible?: boolean;
}

export function DangerPopup(props: DangerPopupProps) {

    const { generalSafetyLevel, connectedToApi } = useContext(AppContext);
    const label = generalSafetyLevel?.label ?? "Unknown";
    const propsIsVisible = props.visible;
    const [isVisible, setIsVisible] = useState<boolean>(propsIsVisible ?? false);
    const dangerPopupClassName = ArrayUtils.filterNotUndefined([
        "danger-popup", props.className
    ]).join(" ");

    useEffect(() => {

        if(propsIsVisible === undefined) setIsVisible(label === 'Danger');

    }, [label]);
    
    useEffect(() => {

        if(propsIsVisible !== undefined) setIsVisible(propsIsVisible);

    }, [propsIsVisible]);

    if (!connectedToApi || !isVisible) return <></>;
    return <>
        <Popup className={dangerPopupClassName} visible={isVisible}>
            <div className="danger-icon-wrapper">
                <FontAwesomeIcon className="danger-icon" icon={faTriangleExclamation}/>
            </div>
            <p>Danger</p>
        </Popup>
    </>;

}
