import {useContext} from "react";
import {KeyboardContext} from "../../../context/KeyboardState.context";
import {runCliCommand} from "../../../utils/runCliCommand";

export const Cli = () => {
    const {setSubmitCliCommand} = useContext(KeyboardContext);

    return (
        <section className="w-full flex-1 h-full flex flex-col">
            <div className="w-full py-2 px-4 flex items-center gap-2 flex-wrap select-none">
                <span className="text-[clamp(0.6rem,1.2vw,0.8rem)] text-green-500">
                    llvovll89@DESKTOP-ABCDE
                </span>
                <span className="text-[clamp(0.6rem,1.2vw,0.8rem)] text-pink-400">
                    MINGW64
                </span>
                <span className="text-[clamp(0.6rem,1.2vw,0.8rem)] text-yellow-300">
                    /d/gh-portfolio
                </span>
                <span className="text-[clamp(0.6rem,1.2vw,0.8rem)] text-blue-300">
                    {"(feature/footer-cli)"}
                </span>
            </div>

            <div className="w-full h-[calc(100%-20px)] text-white font-mono text-xs py-2 px-4 flex gap-1">
                <div className="flex gap-1 h-4 w-max items-center">
                    <span className="w-3 h-3 rounded-full border-2 border-sub-gary"></span>
                    <span className="text-sm">$</span>
                </div>

                <textarea
                    placeholder="help 를 입력해보세요"
                    className="resize-none w-full h-[90%] outline-none bg-transparent"
                    autoFocus
                    onKeyDown={(event) => {
                        // Shift+Enter: 줄바꿈 허용
                        if (event.key !== "Enter" || event.shiftKey) return;

                        // Enter: 실행
                        event.preventDefault();
                        event.stopPropagation();

                        const raw = (event.currentTarget.value ?? "").trim();

                        // 빈 입력은 무시
                        if (!raw) {
                            event.currentTarget.value = "";
                            return;
                        }

                        // clear는 출력 비우기
                        if (raw.toLowerCase() === "clear") {
                            setSubmitCliCommand({
                                value: "",
                                isVisibleCommandUi: true,
                            });
                            event.currentTarget.value = "";
                            return;
                        }

                        const output = runCliCommand(raw);
                        const now = new Date().toLocaleTimeString("ko-KR");
                        const composed = [
                            `[${now}] $ ${raw}`,
                            output ? output : "(no output)",
                        ].join("\n");

                        console.log("CLI Command executed:", { raw, output, composed });

                        setSubmitCliCommand((prev) => {
                            const newValue = prev.value
                                ? `${prev.value}\n\n${composed}`
                                : composed;
                            console.log("Updating CLI output:", { prev: prev.value, new: newValue });
                            return {
                                value: newValue,
                                isVisibleCommandUi: true,
                            };
                        });

                        // 다음 입력을 위해 비우기
                        event.currentTarget.value = "";
                    }}
                ></textarea>
            </div>
        </section>
    );
};
