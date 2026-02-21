import { createContext } from "react";

export interface PopupContextProps {
    isVisible: boolean;
    setIsVisible: (visible: boolean) => void;
}

export const PopupContext = createContext<PopupContextProps>({
    isVisible: false, setIsVisible: () => {}
});
