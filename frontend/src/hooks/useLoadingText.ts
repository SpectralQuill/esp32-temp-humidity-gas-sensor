import { useEffect, useState } from "react";

type LoadingTextIndex = 0 | 1 | 2 | 3;

const LOADING_TEXTS: string[] = ["", ".", "..", "..."];
const LOADING_TEXT_INTERVAL_MS: number = 500;

/**
 * Custom React hook for generating a loading text that cycles through a series of dots.
 * @returns A string representing the current loading text.
 */
export function useLoadingText() {
    const [index, setIndex] = useState<LoadingTextIndex>(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const nextIndex = ((index + 1) %
                LOADING_TEXTS.length) as LoadingTextIndex;
            setIndex(nextIndex);
        }, LOADING_TEXT_INTERVAL_MS);
        return () => clearInterval(intervalId);
    }, [index]);

    return LOADING_TEXTS[index];
}
