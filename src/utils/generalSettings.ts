import { useSyncExternalStore } from "react";
import { SETTINGS_BADGE_STORAGE_KEY, SETTINGS_STORAGE_KEY, SETTINGS_UPDATED_EVENT } from "../constants/settings";

export interface GeneralSettings {
    language: string;
    animationSpeed: string;
}

const DEFAULT_SETTINGS: GeneralSettings = { language: "ko", animationSpeed: "normal" };

function readRaw(): string | null {
    try {
        return localStorage.getItem(SETTINGS_STORAGE_KEY);
    } catch {
        return null;
    }
}

function parse(raw: string | null): GeneralSettings {
    try {
        const stored = raw ? (JSON.parse(raw) as Partial<GeneralSettings> | null) : null;
        return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

/**
 * 설정 패널·언어 전환 버튼·커맨드 팔레트가 공유하는 단일 쓰기 경로.
 * 각자 들고 있던 state 로 덮어써 다른 곳에서 바꾼 값(예: 언어)이 되돌아가는 문제를 막기 위해 항상 저장소 최신값에 병합
 */
export function updateGeneralSettings(patch: Partial<GeneralSettings>): void {
    try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...parse(readRaw()), ...patch }));
        localStorage.setItem(SETTINGS_BADGE_STORAGE_KEY, "1");
    } catch {
        // 저장소 차단 환경에서도 언어 전환 등 화면 동작은 유지
    }
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: { dirty: true } }));
}

function subscribe(onChange: () => void) {
    const handleStorage = (event: StorageEvent) => { if (event.key === SETTINGS_STORAGE_KEY) onChange(); };
    window.addEventListener(SETTINGS_UPDATED_EVENT, onChange);
    window.addEventListener("storage", handleStorage);
    return () => {
        window.removeEventListener(SETTINGS_UPDATED_EVENT, onChange);
        window.removeEventListener("storage", handleStorage);
    };
}

// useSyncExternalStore 는 같은 값이면 같은 참조를 요구하므로 원문 문자열 기준으로 캐시
let cached: { raw: string | null; value: GeneralSettings } | null = null;
function getSnapshot(): GeneralSettings {
    const raw = readRaw();
    if (!cached || cached.raw !== raw) cached = { raw, value: parse(raw) };
    return cached.value;
}

export function useGeneralSettings(): GeneralSettings {
    return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_SETTINGS);
}
