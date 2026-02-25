export type BooleanNumber = 0 | 1;

export class BooleanUtils {

    public static convertToBooleanString(value: unknown): BooleanString {

        const boolean = Boolean(value);
        return boolean ? "true" : "false";

    }

}
