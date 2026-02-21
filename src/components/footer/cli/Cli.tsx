import { useContext, useEffect, useRef } from "react";
import { KeyboardContext } from "../../../context/KeyboardState.context";
import { runCliCommand } from "../../../utils/runCliCommand";

export const Cli = () => {
    const { submitCliCommand, setSubmitCliCommand } = useContext(KeyboardContext);
    const outputRef = useRef<HTMLDivElement>(null);

    // 새 출력이 생길 때마다 스크롤 맨 아래로
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [submitCliCommand.value]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Shift+Enter: 줄바꿈 허용 / 일반 Enter: 실행
        if (event.key !== "Enter" || event.shiftKey) return;

        event.preventDefault();
        event.stopPropagation();

        const raw = event.currentTarget.value.trim();
        if (!raw) {
            event.currentTarget.value = "";
            return;
        }

        // clear 명령: 출력 비우기
        if (raw.toLowerCase() === "clear") {
            setSubmitCliCommand({ value: "", isVisibleCommandUi: false });
            event.currentTarget.value = "";
            return;
        }

        const output = runCliCommand(raw);
        const now = new Date().toLocaleTimeString("ko-KR");
        const composed = [`[${now}] $ ${raw}`, output || "(no output)"].join("\n");

        setSubmitCliCommand((prev) => {
            const newValue = prev.value
                ? `${prev.value}\n\n${composed}`
                : composed;
            return { value: newValue, isVisibleCommandUi: false };
        });

        event.currentTarget.value = "";
    };

    return (
        <section className="w-full h-full flex flex-col bg-zinc-950 font-mono text-[11px]">
            {/* 출력 영역 */}
            <div
                ref={outputRef}
                className="flex-1 overflow-auto px-4 py-2 leading-relaxed scrolls"
            >
                {submitCliCommand.value ? (
                    <pre className="whitespace-pre-wrap break-words text-zinc-200 m-0">
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
                    onKeyDown={handleKeyDown}
                />
            </div>
        </section>
    );
};
