import { useState } from "react";
export function useCount(
    start: number = 0,
    increment: number = 1
): [
    number,
    () => void,
    () => void
] {

    const [count, setCount] = useState(start);
    
    const addCount = () => setCount(count + increment);
    const resetCount = () => setCount(start);

    return [count, addCount, resetCount];

}
