export type ArrayItemCompareFunc<T> = (a: T, b: T) => number;

export class ArrayUtils {

    public static binarySearchIndex<T>(
        array: T[],
        target: T,
        compare: ArrayItemCompareFunc<T>
    ): number {

        if (array.length === 0) return 0;
        let start = 0;
	    let end = array.length - 1;

        while (start !== end) {
		
            const next = Math.floor((start + end) / 2);
            const comparison = compare(target, array[next]);
            if (comparison <= next)
                end = next;
            else
                start = next + 1;

        }

        return start;

    }

    public static clearArray<T>(array: T[]): T[] {

        array.splice(0, array.length)
        return array;

    }
    
    public static filterNotUndefined<T>(array: (T | undefined)[]): T[] {
        return array.filter((item: T | undefined) => item !== undefined);
    }

}
