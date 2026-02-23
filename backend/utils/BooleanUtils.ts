export class BooleanUtils {

    static parseBoolean(value?: string | boolean | number | null): boolean {

        if (typeof value === "boolean") return value;
        if (value === "true" || value == "1")
            return true;
        if (value === "false" || value == "0" || value == undefined)
            return false;
        throw new Error(`Invalid boolean value: ${value}`);
    
    }

}
