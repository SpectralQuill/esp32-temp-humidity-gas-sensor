import { ArrayUtils } from "../utils/ArrayUtils";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PopupContext, PopupContextProps } from "../contexts/PopupContext";
import { useContext, useState } from "react";

import "../style/Popup.scss";

interface PopupProps {
    children: React.ReactNode;
    className?: string;
    isUnclosable?: boolean;
    visible?: boolean;
}

/** * A reusable popup component that can be used to display any content in a modal-like fashion.
 * @param className - Optional additional class name(s) to apply to the popup wrapper for custom styling.
 * @param isUnclosable - If true, the popup will not display a close button and cannot be closed by the user.
 * @param visible - Optional initial visibility state of the popup. Defaults to false (hidden).
 * @param children - The content to be displayed inside the popup.
 * @returns A JSX element representing the Popup component.
 */
export function Popup(props: PopupProps) {

    const { children, className, isUnclosable } = props;

    const [isVisible, setIsVisible] = useState<boolean>(props.visible ?? false);

    const [popupContext] = useState<PopupContextProps>({
        isVisible, setIsVisible
    });

    const popupWrapperClassName: string = ArrayUtils.filterNotUndefined([
        "popup-wrapper",
        className,
        isVisible ? undefined : "hidden",
    ]).join(" ");

    return (
        <PopupContext.Provider value={popupContext}>
            <div className={popupWrapperClassName}>
                <div className="popup-backdrop"></div>
                <div className="popup-content">
                    <div className="popup-header">
                        {!isUnclosable && <PopupCloseButton />}
                    </div>
                    <div className="popup-body font-medium">
                        {children}
                    </div>
                </div>
            </div>
        </PopupContext.Provider>
    );

}

/** * A button component that, when clicked, sets the visibility of the parent Popup to false.
 * This component should be used within a Popup component, as it relies on the PopupContext to function properly.
 */
function PopupCloseButton() {

    const { setIsVisible } = useContext(PopupContext);

    const handleClick = (): void => setIsVisible(false);

    return (
        <button className="popup-close-button font-large" onClick={handleClick}>
            <FontAwesomeIcon icon={faX} />
        </button>
    );
    
}
