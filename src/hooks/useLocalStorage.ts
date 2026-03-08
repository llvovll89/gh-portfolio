import { useState, useEffect } from "react";

/**
 * localStorage와 React state를 동기화하는 범용 훅
 * @param key localStorage 키
 * @param initialValue 초기값 (저장된 값 없을 때 사용)
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? (JSON.parse(item) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(storedValue));
        } catch {
            // 스토리지 용량 초과 등 무시
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
