export type ArrayItemCompareFunc<T> = (a: T, b: T) => number;

export class ArrayUtils {

    public static binarySearchIndex<T>(
        array: T[] | ReadonlyArray<T>,
        target: T,
        compare: ArrayItemCompareFunc<T>,
        startIndex: number = 0,
        endIndex: number = array.length
    ): number {

        if (array.length === 0) return 0;

        while (startIndex !== endIndex) {
		
            const nextIndex = Math.floor((startIndex + endIndex) / 2);
            const comparison = compare(target, array[nextIndex]);
            if (comparison <= 0)
                endIndex = nextIndex;
            else
                startIndex = nextIndex + 1;

        }

        return startIndex;

    }

    public static clearArray<T>(array: T[]): T[] {

        array.length = 0;
        return array;

    }
    
    public static filterNotUndefined<T>(
        array: (T | undefined)[]
    ): T[] {
        return array.filter((item: T | undefined) => item !== undefined);
    }

}
