import {
    useEffect,
    useState
} from "react";

export const LOADING_TEXTS = ["", ".", "..", "..."] as const satisfies ReadonlyArray<string>;

/**
 * Custom React hook for generating a loading text that cycles through a series of dots.
 * @returns A string representing the current loading text.
 */
export function useLoadingText(
    active: boolean,
    loadingIntervalMs: number = 1000,
    loadingTexts: ReadonlyArray<string> = LOADING_TEXTS
) {

    const { length } = loadingTexts;
    const [index, setIndex] = useState<number>(0);

    useEffect(() => {

        if (!active) {

            setIndex(0);
            return;

        }
        let cancelled = false;
        const handleUpdate = () => {
            if (cancelled) {

                setIndex(0);
                return;

            }
            setIndex(index => (index + 1) % length);
            setTimeout(handleUpdate, loadingIntervalMs);
        };

        setTimeout(handleUpdate, loadingIntervalMs);

        return () => { cancelled = true; };

    }, [active]);

    return loadingTexts[index];

}
