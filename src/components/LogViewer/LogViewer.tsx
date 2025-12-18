import {useContext} from "react";
import {KeyboardContext} from "../../context/KeyboardState.context";
import {Contents} from "../contents/Contents";

export const LogViewer = () => {
    const {submitCliCommand, setSubmitCliCommand} = useContext(KeyboardContext);

    return (
        <Contents className="select-none z-100">
            <section className="w-full h-full bg-[rgba(0,0,0,0.52)] text-white py-4 px-5 flex flex-col items-center">
                <header className="w-full h-10 flex items-center justify-between">
                    <p className="w-[calc(100%-140px)] text-2xl font-bold flex justify-start">
                        CLI Command Output
                    </p>

                    <button
                        className="w-35 h-full text-xs cursor-pointer flex flex-col"
                        onClick={() =>
                            setSubmitCliCommand({
                                value: "",
                                isVisibleCommandUi: false,
                            })
                        }
                    >
                        <span>닫기</span>
                        <span>(클릭 OR ESC키 2번 입력)</span>
                    </button>
                </header>
                <article className="flex flex-col w-full">
                    {submitCliCommand.value}
                </article>
            </section>
        </Contents>
    );
};
