import { NumberUtils } from "./NumberUtils";

export class BooleanUtils {

    public static convertToBoolean(value: unknown): boolean {

        if (NumberUtils.isNumber(value)) {

            const number = Number(value);
            return Boolean(number);

        } else if (typeof value === "string") {

            value = value.toLowerCase().trim();
            switch(value) {
                case "true": return true;
                case "false": return false;
                default: return Boolean(value);
            }

        } else return Boolean(value);

    }

    public static convertToBooleanString(value: unknown): BooleanString {

        const boolean = Boolean(value);
        return boolean ? "true" : "false";

    }

    public static isBooleanString(string: string): boolean {

        string = string.toLowerCase().trim();
        return (string === "true") || (string === "false");

    }

}
