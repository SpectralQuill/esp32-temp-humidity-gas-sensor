import { AppContext } from "../contexts/AppContext";
import { ArrayUtils } from "../utils/ArrayUtils";
import { Popup } from "./Popup";
import { useContext, useEffect, useState } from "react";

interface DangerPopupProps {
    className?: string;
    visible?: boolean;
}

export function DangerPopup(props: DangerPopupProps) {

    const {
        generalSafetyLevel: {label},
        isConnectedToDatabase
    } = useContext(AppContext);
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

    if (!isConnectedToDatabase || !isVisible) return <></>;
    return <>
        <Popup className={dangerPopupClassName} visible={isVisible}>
            Danger!
        </Popup>
    </>;

}
