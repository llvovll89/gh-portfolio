import { useState, useRef, useEffect } from "react";
import { FiShare2, FiLink, FiCheck, FiTwitter } from "react-icons/fi";
import { RiKakaoTalkFill } from "react-icons/ri";

interface ShareButtonProps {
    title: string;
    summary?: string;
    url?: string;
}

const BASE_URL = "https://kimgeonho.vercel.app";

export const ShareButton = ({ title, summary, url }: ShareButtonProps) => {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fullUrl = `${BASE_URL}${url ?? window.location.pathname}`;
    const text = summary ? `${title}\n${summary}` : title;

    // 외부 클릭 시 닫기
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Web Share API — 지원하는 환경(모바일 등)에서 네이티브 공유
    const handleNativeShare = async () => {
        try {
            await navigator.share({ title, text: summary ?? title, url: fullUrl });
        } catch {
            // 취소한 경우 무시
        }
    };

    // 링크 복사
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // 구형 브라우저 fallback
            const ta = document.createElement("textarea");
            ta.value = fullUrl;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        setOpen(false);
    };

    // X(트위터) 공유
    const handleTwitter = () => {
        const tweet = encodeURIComponent(`${text}\n${fullUrl}`);
        window.open(`https://twitter.com/intent/tweet?text=${tweet}`, "_blank", "noopener,noreferrer");
        setOpen(false);
    };

    // 카카오톡 공유 (URL scheme — KakaoSDK 없이 앱 딥링크 사용)
    const handleKakao = () => {
        void navigator.clipboard.writeText(fullUrl).catch(() => {});
        window.open(
            `kakaotalk://msg/send?text=${encodeURIComponent(`${title}\n${fullUrl}`)}`,
            "_blank"
        );
        setOpen(false);
    };

    const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

    // 네이티브 공유 지원 환경: 버튼 하나로 바로 공유
    if (canNativeShare) {
        return (
            <button
                onClick={handleNativeShare}
                aria-label="포스트 공유"
                className={[
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                    "text-zinc-500 dark:text-zinc-400",
                    "border border-zinc-200/70 dark:border-zinc-700/50",
                    "hover:text-zinc-800 dark:hover:text-zinc-200",
                    "hover:border-zinc-300 dark:hover:border-zinc-600",
                    "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                    "transition-all duration-200",
                ].join(" ")}
            >
                <FiShare2 className="w-3.5 h-3.5" />
                <span>공유</span>
            </button>
        );
    }

    // 폴백: 드롭다운 메뉴
    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label="공유 옵션"
                aria-expanded={open}
                className={[
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                    "text-zinc-500 dark:text-zinc-400",
                    "border border-zinc-200/70 dark:border-zinc-700/50",
                    "hover:text-zinc-800 dark:hover:text-zinc-200",
                    "hover:border-zinc-300 dark:hover:border-zinc-600",
                    "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                    "transition-all duration-200",
                    open ? "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-600" : "",
                ].join(" ")}
            >
                <FiShare2 className="w-3.5 h-3.5" />
                <span>공유</span>
            </button>

            {open && (
                <div
                    role="menu"
                    className={[
                        "absolute right-0 top-full mt-1.5 z-50",
                        "w-44 rounded-xl overflow-hidden",
                        "bg-white dark:bg-zinc-900",
                        "border border-zinc-200/80 dark:border-zinc-700/60",
                        "shadow-xl shadow-black/10 dark:shadow-black/40",
                        "animate-in fade-in slide-in-from-top-1 duration-150",
                    ].join(" ")}
                >
                    <button
                        role="menuitem"
                        onClick={handleCopy}
                        className={[
                            "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm",
                            "text-zinc-700 dark:text-zinc-300",
                            "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                            "transition-colors duration-150",
                        ].join(" ")}
                    >
                        {copied
                            ? <FiCheck className="w-4 h-4 text-green-500" />
                            : <FiLink className="w-4 h-4" />
                        }
                        <span>{copied ? "복사됨!" : "링크 복사"}</span>
                    </button>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

                    <button
                        role="menuitem"
                        onClick={handleTwitter}
                        className={[
                            "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm",
                            "text-zinc-700 dark:text-zinc-300",
                            "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                            "transition-colors duration-150",
                        ].join(" ")}
                    >
                        <FiTwitter className="w-4 h-4" />
                        <span>X (트위터)</span>
                    </button>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

                    <button
                        role="menuitem"
                        onClick={handleKakao}
                        className={[
                            "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm",
                            "text-zinc-700 dark:text-zinc-300",
                            "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                            "transition-colors duration-150",
                        ].join(" ")}
                    >
                        <RiKakaoTalkFill className="w-4 h-4 text-yellow-500" />
                        <span>카카오톡</span>
                    </button>
                </div>
            )}
        </div>
    );
};
