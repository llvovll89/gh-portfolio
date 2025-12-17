import { useContext } from "react";
import { KeyboardContext } from "../../../context/KeyboardState.context";
import { GlobalStateContext } from "../../../context/GlobalState.context";

export const Cli = () => {
    const { selectedTheme } = useContext(GlobalStateContext);
    const { submitCliCommand } = useContext(KeyboardContext);

    return (
        <section className="w-full h-[calc(100%-32px)] flex flex-col">
            <div className="w-full py-2 px-4 flex items-center gap-2 text-xs">
                <span className="text-green-500">llvovll89@DESKTOP-ABCDE</span>
                <span className="text-pink-400">MINGW64</span>
                <span className="text-yellow-300">/d/gh-portfolio</span>
                <span className="text-blue-300">{"(feature/footer-cli)"}</span>
            </div>

            <div className={`w-full h-[calc(100%-32px)] ${selectedTheme.mode} text-white font-mono text-xs py-2 px-4 flex gap-1`}>
                <div className="flex gap-1 h-4 w-max items-center">
                    <span className="w-3 h-3 rounded-full border-2 border-sub-gary"></span>
                    <span className="text-sm">$</span>
                </div>
                <textarea className="resize-none w-full h-full outline-none" autoFocus></textarea>
            </div>

            {submitCliCommand.isVisibleCommandUi && (
                <section className="select-none fixed left-0 top-0 w-screen h-screen bg-sub-navy/30 flex items-center justify-center">
                    <article>
                        <p>{submitCliCommand.value}</p>
                    </article>
                </section>
            )}
        </section>
    )
};