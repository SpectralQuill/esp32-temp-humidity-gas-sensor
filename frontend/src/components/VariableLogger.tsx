import { ArrayUtils } from "../utils/ArrayUtils";

import "../style/VariableLogger.scss";

interface VariableLoggerProps<T> {
    children: React.ReactNode;
    variable: T;
    visible?: boolean
}

export function VariableLogger<T>(props: VariableLoggerProps<T>) {

    const { children, variable, visible } = props;

    const variableLoggerClassName: string = ArrayUtils.filterNotUndefined([
            "variable-logger font-large",
            visible ? undefined : "hidden",
        ]).join(" ");

    const handleClick = () => console.log(variable);


    return <>
        <button className={variableLoggerClassName} onClick={handleClick}>
            {children}
        </button>
    </>;

}
