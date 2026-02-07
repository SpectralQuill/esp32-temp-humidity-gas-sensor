import { ArrayUtils } from "../utils/ArrayUtils";
import { createContext } from 'react';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useState } from 'react';

import '../style/Popup.scss';

interface PopupContext {
    isVisible: boolean;
    setIsVisible: (visible: boolean) => void;
}

interface PopupProps {
    children: React.ReactNode;
    className?: string;
    isUnclosable?: boolean;
    visible?: boolean;
}

const PopupContext = createContext<PopupContext>({
    isVisible: false,
    setIsVisible: () => {},
});

export function Popup(props: PopupProps) {

    const { className, isUnclosable } = props;
    const [isVisible, setIsVisible] = useState<boolean>(props.visible ?? false);
    const [context] = useState<PopupContext>({
        isVisible, setIsVisible
    });
    const popupWrapperClassName: string = ArrayUtils.filterNotUndefined([
        'popup-wrapper',
        className,
        isVisible ? undefined : 'hidden'
    ]).join(" ");

    return <PopupContext.Provider value={context}>
        <div className={popupWrapperClassName}>
            <div className="popup-backdrop"></div>
            <div className="popup-content">
                <div className="popup-header">
                    {!isUnclosable && <PopupCloseButton />}
                </div>
                <div className="popup-body font-medium">
                    {props.children}
                </div>
            </div>
        </div>
    </PopupContext.Provider>;

}

function PopupCloseButton() {

    const { setIsVisible } = useContext(PopupContext);
    const handleClick = (): void => setIsVisible(false);

    return <button className="popup-close-button font-large" onClick={handleClick}>
        <FontAwesomeIcon icon={faX}/>
    </button>;

}
