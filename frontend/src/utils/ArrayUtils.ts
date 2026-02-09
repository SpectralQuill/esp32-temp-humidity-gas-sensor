export class ArrayUtils {

    static clearArray<T>(array: T[]): T[] {

        array.splice(0, array.length)
        return array;

    }
    
    static filterNotUndefined<T>(array: (T | undefined)[]): T[] {
        return array.filter((item: T | undefined) => item !== undefined);
    }

}
