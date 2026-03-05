export const HEX_CHAR_REGEX = /(?:[0-9a-f])/gi;
export const SIX_CHAR_HEX_REGEX = /^#?(?:[0-9a-f]{6})$/i;
export const THREE_CHAR_HEX_REGEX = /^#?(?:[0-9a-f]{3})$/i;

export function hexColor(
    substrings: TemplateStringsArray,
    ...values: (string | number | undefined | null)[]
): string {
    
    const length = Math.max(substrings.length, values.length);
    let string = "";
    for (let index = 0; index < length; index++) {

        const value: string = (values[index] != undefined) ? String(values[index]) : "";
        string += substrings[index] + value;

    }
    string = string.trim();

    if (SIX_CHAR_HEX_REGEX.test(string) || THREE_CHAR_HEX_REGEX.test(string)) {

        if (string[0] !== "#") string = "#" + string;
        if (string.length === 4) {

            let color = "";
            for(let index = 1; index < 4; index++)
                color += string[index] + string[index];
            string = color;

        }
        
        return string.toLowerCase();

    } else throw new Error(`Invalid hex color reading "${ string }"`);

}
