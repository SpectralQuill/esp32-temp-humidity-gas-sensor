export class ArrayUtils {

    static filterNotUndefined<T>(array: (T | undefined)[]): T[] {
        return array.filter((item: T | undefined) => (item !== undefined));
    }

}
