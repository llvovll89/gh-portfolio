import { useEffect, useState } from "react";

/**
 * idle           - 표시 조건 미충족 (이미 설치됨 / 닫음 / 데스크탑)
 * android        - Chrome/Edge/Samsung Internet: 네이티브 설치 프롬프트 가능
 * android-manual - Firefox 등 beforeinstallprompt 미지원 Android 브라우저
 * ios-safari     - iOS Safari: 공유 → 홈 화면에 추가 가이드
 * ios-chrome     - iOS Chrome: 공유 버튼 → 홈 화면에 추가 가이드
 * ios-other      - iOS Firefox 등: Safari에서 열도록 안내
 * installed      - 이미 설치됨
 */
export type InstallState =
    | { status: "idle" }
    | { status: "android"; prompt: () => void }
    | { status: "android-manual" }
    | { status: "ios-safari" }
    | { status: "ios-chrome" }
    | { status: "ios-other" }
    | { status: "installed" };

const DISMISSED_KEY = "pwa-install-dismissed";
const DISMISSED_DURATION = 1000 * 60 * 60 * 24 * 7; // 7일

function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isIosSafari() {
    const ua = navigator.userAgent;
    return isIos() && /safari/i.test(ua) && !/crios|fxios|opios|chrome|edgios/i.test(ua);
}

function isIosChrome() {
    return isIos() && /crios/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
    );
}

function isDismissed() {
    try {
        const raw = localStorage.getItem(DISMISSED_KEY);
        if (!raw) return false;
        return Date.now() - Number(raw) < DISMISSED_DURATION;
    } catch {
        return false;
    }
}

export function usePWAInstall() {
    const [state, setState] = useState<InstallState>({ status: "idle" });

    useEffect(() => {
        if (isInStandaloneMode()) {
            setState({ status: "installed" });
            return;
        }
        if (isDismissed()) return;

        // iOS 계열
        if (isIos()) {
            if (isIosSafari()) setState({ status: "ios-safari" });
            else if (isIosChrome()) setState({ status: "ios-chrome" });
            else setState({ status: "ios-other" });
            return;
        }

        // Android/Chrome/Edge/Samsung Internet: 네이티브 프롬프트 대기
        let fired = false;
        const handler = (e: Event) => {
            fired = true;
            e.preventDefault();
            const deferredPrompt = e as BeforeInstallPromptEvent;
            setState({
                status: "android",
                prompt: async () => {
                    await deferredPrompt.prompt();
                    const choice = await deferredPrompt.userChoice;
                    if (choice.outcome === "accepted") {
                        setState({ status: "installed" });
                    } else {
                        dismiss();
                    }
                },
            });
        };

        window.addEventListener("beforeinstallprompt", handler);

        // 이벤트가 발생하지 않는 브라우저(Firefox 등) → 3초 후 수동 안내
        const fallbackTimer = setTimeout(() => {
            if (!fired && !isInStandaloneMode()) {
                setState({ status: "android-manual" });
            }
        }, 3000);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            clearTimeout(fallbackTimer);
        };
    }, []);

    function dismiss() {
        try {
            localStorage.setItem(DISMISSED_KEY, String(Date.now()));
        } catch {
            // ignore
        }
        setState({ status: "idle" });
    }

    return { state, dismiss };
}

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
