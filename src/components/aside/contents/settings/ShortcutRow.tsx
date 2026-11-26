import { useState } from "react";
import { useTranslation } from "react-i18next";
import { VscEdit, VscRefresh } from "react-icons/vsc";
import { formatKeyCombo } from "../../../../constants/keyboardConstants";
import { eventToKeyCombination, isValidShortcut } from "../../../../hooks/useKeyboardShortcuts";
import type { KeyCombination } from "../../../../types/Keyboard.types";
import { uiText } from "../../../../utils/uiText";

const MODIFIER_CODES = ["ControlLeft", "ControlRight", "ShiftLeft", "ShiftRight", "AltLeft", "AltRight", "MetaLeft", "MetaRight"];
// 브라우저가 페이지보다 먼저 처리해 가로챌 수 없는 조합 (탭 닫기·새 탭·새 창)
const BROWSER_RESERVED = ["KeyW", "KeyT", "KeyN"];

type SaveResult = { success: boolean; conflictId?: string };

interface ShortcutRowProps {
    label: string;
    combo: KeyCombination;
    customized: boolean;
    /** false 면 편집 불가 (예: Esc 두 번으로 동작하는 '모든 UI 닫기') */
    editable: boolean;
    onSave: (combo: KeyCombination) => SaveResult;
    onReset: () => void;
    describe: (id: string) => string;
}

/** 단축키 한 줄 — '변경'을 누른 뒤 원하는 키 조합을 누르면 저장 (Esc 취소) */
export const ShortcutRow = ({ label, combo, customized, editable, onSave, onReset, describe }: ShortcutRowProps) => {
    const { t } = useTranslation();
    const [recording, setRecording] = useState(false);
    const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);

    const handleRecordKey = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (!recording) return;
        // 녹화 중에는 전역 단축키·브라우저 기본 동작이 실행되지 않도록 막음 (전역 처리기는 defaultPrevented 면 건너뜀)
        event.preventDefault();
        event.stopPropagation();
        if (event.key === "Escape") {
            setRecording(false);
            return;
        }
        if (MODIFIER_CODES.includes(event.code)) return; // 수정자만 누른 상태 → 나머지 키를 기다림

        const next = eventToKeyCombination(event);
        const isFunctionKey = /^F\d{1,2}$/.test(next.key);
        if (!isFunctionKey && !isValidShortcut(next)) {
            setMessage({ kind: "error", text: t("settings.shortcutNeedsModifier") });
            return;
        }
        if ((next.ctrl || next.meta) && BROWSER_RESERVED.includes(next.key)) {
            setMessage({ kind: "error", text: t("settings.shortcutReserved") });
            return;
        }
        const result = onSave(next);
        if (result.success) {
            setRecording(false);
            setMessage({ kind: "ok", text: t("settings.shortcutSaved", { combo: formatKeyCombo(next) }) });
        } else {
            setMessage({ kind: "error", text: result.conflictId ? t("settings.shortcutConflict", { name: describe(result.conflictId) }) : t("settings.shortcutSaveFailed") });
        }
    };

    return (
        <li className="p-2 bg-sub-gary/20 rounded hover:bg-sub-gary/30 transition-colors group">
            <div className="flex items-center justify-between gap-2">
                <span className="text-2xs text-muted flex-1">{label}</span>
                <div className="flex items-center gap-1.5">
                    <kbd
                        className={`px-2 py-1 text-2xs bg-sub-gary/40 text-foreground rounded border ${recording ? "border-primary animate-pulse" : customized ? "border-primary/50" : "border-sub-gary/30"}`}
                    >
                        {recording ? t("settings.shortcutRecording") : formatKeyCombo(combo)}
                    </kbd>
                    {editable && (
                        <button
                            type="button"
                            onClick={() => { setMessage(null); setRecording(value => !value); }}
                            onKeyDown={handleRecordKey}
                            onBlur={() => setRecording(false)}
                            aria-pressed={recording}
                            aria-label={`${label} ${t("settings.shortcutEdit")}`}
                            title={t("settings.shortcutEdit")}
                            className={`p-1 rounded transition-colors ${recording ? "text-primary bg-primary/15" : "text-muted hover:text-foreground"}`}
                        >
                            <VscEdit className="w-3 h-3" aria-hidden="true" />
                        </button>
                    )}
                    {customized && !recording && (
                        <button
                            type="button"
                            onClick={() => { onReset(); setMessage(null); }}
                            className="p-1 text-muted hover:text-foreground rounded transition-colors"
                            title={uiText("기본값으로 복원")}
                            aria-label={`${label} ${uiText("기본값으로 복원")}`}
                        >
                            <VscRefresh className="w-3 h-3" aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>
            {message && (
                <p role={message.kind === "error" ? "alert" : "status"} className={`mt-1.5 text-2xs ${message.kind === "error" ? "text-error" : "text-muted"}`}>
                    {message.text}
                </p>
            )}
        </li>
    );
};
