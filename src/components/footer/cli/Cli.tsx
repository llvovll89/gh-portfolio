import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardContext } from "../../../context/KeyboardState.context";
import { getCliSuggestions, runCliCommand } from "../../../utils/runCliCommand";
import { exportCliSession, type CliExportFormat } from "../../../utils/exportCliSession";
import {
    CLI_TUTORIAL_STEPS,
    formatTutorialStep,
    isExpectedTutorialCommand,
} from "../../../utils/tutorials";

const CLI_HISTORY_STORAGE_KEY = "portfolio-cli-history";
const MAX_HISTORY = 50;

const getSharedPrefix = (values: string[]): string => {
    if (values.length === 0) return "";
    if (values.length === 1) return values[0];

    let prefix = values[0];
    for (let i = 1; i < values.length; i++) {
        while (!values[i].startsWith(prefix) && prefix) {
            prefix = prefix.slice(0, -1);
        }
        if (!prefix) break;
    }
    return prefix;
};

export const Cli = () => {
    const { submitCliCommand, setSubmitCliCommand } = useContext(KeyboardContext);
    const outputRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [tutorialStepIndex, setTutorialStepIndex] = useState<number | null>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(CLI_HISTORY_STORAGE_KEY);
            if (!stored) return;
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                setHistory(
                    parsed.filter((value): value is string => typeof value === "string"),
                );
            }
        } catch {
            // ignore storage parsing errors
        }
    }, []);

    // 새 출력이 생길 때마다 스크롤 맨 아래로
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [submitCliCommand.value]);

    const suggestions = useMemo(() => getCliSuggestions(inputValue), [inputValue]);

    const writeHistory = (next: string[]) => {
        try {
            localStorage.setItem(CLI_HISTORY_STORAGE_KEY, JSON.stringify(next));
        } catch {
            // ignore storage errors
        }
    };

    const appendSystemLog = (message: string) => {
        const now = new Date().toLocaleTimeString("ko-KR");
        const composed = `[${now}] ${message}`;

        setSubmitCliCommand((prev) => ({
            value: prev.value ? `${prev.value}\n\n${composed}` : composed,
            isVisibleCommandUi: false,
        }));
    };

    const appendCommandLog = (command: string, output: string) => {
        const now = new Date().toLocaleTimeString("ko-KR");
        const composed = [`[${now}] $ ${command}`, output || "(no output)"].join("\n");

        setSubmitCliCommand((prev) => {
            const newValue = prev.value ? `${prev.value}\n\n${composed}` : composed;
            return { value: newValue, isVisibleCommandUi: false };
        });
    };

    const runTutorialCommand = (raw: string): boolean => {
        const [, subRaw = "start"] = raw.trim().split(/\s+/);
        const sub = subRaw.toLowerCase();

        if (sub === "start") {
            setTutorialStepIndex(0);
            appendCommandLog(raw, [
                "CLI 튜토리얼을 시작합니다.",
                formatTutorialStep(0),
                "다음 단계로 이동: tutorial next",
            ].join("\n"));
            return true;
        }

        if (sub === "status") {
            if (tutorialStepIndex === null) {
                appendCommandLog(raw, "튜토리얼이 비활성 상태입니다. tutorial start 로 시작하세요.");
                return true;
            }

            appendCommandLog(raw, formatTutorialStep(tutorialStepIndex));
            return true;
        }

        if (sub === "stop") {
            setTutorialStepIndex(null);
            appendCommandLog(raw, "튜토리얼을 종료했습니다.");
            return true;
        }

        if (sub === "next") {
            if (tutorialStepIndex === null) {
                appendCommandLog(raw, "튜토리얼이 비활성 상태입니다. tutorial start 로 시작하세요.");
                return true;
            }

            const next = Math.min(tutorialStepIndex + 1, CLI_TUTORIAL_STEPS.length - 1);
            setTutorialStepIndex(next);
            appendCommandLog(raw, formatTutorialStep(next));
            return true;
        }

        if (sub === "prev") {
            if (tutorialStepIndex === null) {
                appendCommandLog(raw, "튜토리얼이 비활성 상태입니다. tutorial start 로 시작하세요.");
                return true;
            }

            const prev = Math.max(tutorialStepIndex - 1, 0);
            setTutorialStepIndex(prev);
            appendCommandLog(raw, formatTutorialStep(prev));
            return true;
        }

        appendCommandLog(raw, "usage: tutorial <start|next|prev|status|stop>");
        return true;
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Tab") {
            event.preventDefault();
            event.stopPropagation();

            const nextSuggestions = getCliSuggestions(inputValue);
            if (nextSuggestions.length === 0) return;

            if (nextSuggestions.length === 1) {
                const only = nextSuggestions[0];
                setInputValue(only.includes(" ") ? `${only} ` : `${only} `);
                return;
            }

            const sharedPrefix = getSharedPrefix(nextSuggestions);
            const current = inputValue.trimStart().toLowerCase();
            if (sharedPrefix && sharedPrefix.toLowerCase() !== current) {
                setInputValue(sharedPrefix);
                return;
            }

            appendSystemLog(`suggestions: ${nextSuggestions.join(", ")}`);
            return;
        }

        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            if (history.length === 0) return;

            event.preventDefault();
            event.stopPropagation();

            if (event.key === "ArrowUp") {
                const nextIndex =
                    historyIndex === -1
                        ? history.length - 1
                        : Math.max(0, historyIndex - 1);
                setHistoryIndex(nextIndex);
                setInputValue(history[nextIndex]);
                return;
            }

            if (historyIndex === -1) return;
            const nextIndex = historyIndex + 1;
            if (nextIndex >= history.length) {
                setHistoryIndex(-1);
                setInputValue("");
                return;
            }

            setHistoryIndex(nextIndex);
            setInputValue(history[nextIndex]);
            return;
        }

        // Shift+Enter: 줄바꿈 허용 / 일반 Enter: 실행
        if (event.key !== "Enter" || event.shiftKey) return;

        event.preventDefault();
        event.stopPropagation();

        const raw = inputValue.trim();
        if (!raw) {
            setInputValue("");
            return;
        }

        const nextHistory = [...history.filter((value) => value !== raw), raw].slice(
            -MAX_HISTORY,
        );
        setHistory(nextHistory);
        setHistoryIndex(-1);
        writeHistory(nextHistory);

        // clear 명령: 출력 비우기
        if (raw.toLowerCase() === "clear") {
            setSubmitCliCommand({ value: "", isVisibleCommandUi: false });
            setInputValue("");
            return;
        }

        if (raw.toLowerCase().startsWith("tutorial")) {
            runTutorialCommand(raw);
            setInputValue("");
            return;
        }

        if (raw.toLowerCase().startsWith("export")) {
            const [, maybeFormat] = raw.split(/\s+/);
            const format: CliExportFormat = maybeFormat?.toLowerCase() === "md" ? "md" : "txt";

            try {
                const fileName = exportCliSession(submitCliCommand.value, format);
                appendCommandLog(raw, `✓ exported: ${fileName}`);
            } catch {
                appendCommandLog(raw, "export 실패: 브라우저에서 파일 다운로드를 허용해주세요.");
            }

            setInputValue("");
            return;
        }

        const output = runCliCommand(raw);
        appendCommandLog(raw, output);

        if (tutorialStepIndex !== null) {
            const isMatched = isExpectedTutorialCommand(tutorialStepIndex, raw);
            if (isMatched) {
                const isLastStep = tutorialStepIndex >= CLI_TUTORIAL_STEPS.length - 1;
                if (isLastStep) {
                    setTutorialStepIndex(null);
                    appendSystemLog("tutorial: 완료! 다시 시작하려면 tutorial start 를 입력하세요.");
                } else {
                    const nextStep = tutorialStepIndex + 1;
                    setTutorialStepIndex(nextStep);
                    appendSystemLog(["tutorial: good job", formatTutorialStep(nextStep)].join("\n"));
                }
            }
        }

        setInputValue("");
    };

    return (
        <section className="w-full h-full flex flex-col bg-zinc-950 font-mono text-[11px]">
            {/* 출력 영역 */}
            <div
                ref={outputRef}
                className="flex-1 overflow-auto px-4 py-2 leading-relaxed scrolls"
            >
                {submitCliCommand.value ? (
                    <pre className="whitespace-pre-wrap wrap-break-word text-zinc-200 m-0">
                        {submitCliCommand.value}
                    </pre>
                ) : (
                    <p className="text-zinc-500 mt-1">
                        <span className="text-primary">help</span>를 입력하면 사용 가능한 명령어를 볼 수 있어요.
                    </p>
                )}
            </div>

            {/* 입력 영역 */}
            <div className="shrink-0 border-t border-white/10 px-3 py-1.5 flex items-center gap-1.5 bg-zinc-950">
                <span className="text-green-400 select-none shrink-0">llvovll89@DESKTOP</span>
                <span className="text-yellow-300 select-none shrink-0">/d/gh-portfolio</span>
                <span className="text-blue-300 select-none shrink-0">(main)</span>
                <span className="text-zinc-400 select-none shrink-0">$</span>
                <textarea
                    rows={1}
                    autoFocus
                    placeholder="help"
                    className="flex-1 resize-none outline-none bg-transparent text-zinc-100 placeholder:text-zinc-600 leading-relaxed"
                    value={inputValue}
                    onChange={(event) => {
                        setInputValue(event.target.value);
                        setHistoryIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {suggestions.length > 0 && inputValue.trim().length > 0 && (
                <div className="shrink-0 border-t border-white/10 px-3 py-1 text-[10px] text-zinc-500 bg-zinc-950">
                    Tab 자동완성: {suggestions.slice(0, 4).join(" | ")}
                </div>
            )}
        </section>
    );
};
