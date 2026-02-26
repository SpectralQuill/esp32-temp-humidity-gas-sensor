import {
    useEffect,
    useState
} from "react";

export const LOADING_TEXTS: ReadonlyArray<string> = ["", ".", "..", "..."] as const;

/**
 * Custom React hook for generating a loading text that cycles through a series of dots.
 * @returns A string representing the current loading text.
 */
export function useLoadingText(
    loadingIntervalMs: number = 500,
    loadingTexts: string[] = LOADING_TEXTS as string[]
) {

    const { length } = loadingTexts;
    const [index, setIndex] = useState<number>(0);

    useEffect(() => {

        const intervalId = setInterval(() => {
            const nextIndex = (index + 1) % length;
            setIndex(nextIndex);
        }, loadingIntervalMs);
        return () => clearInterval(intervalId);

    }, []);

    return loadingTexts[index];

}
