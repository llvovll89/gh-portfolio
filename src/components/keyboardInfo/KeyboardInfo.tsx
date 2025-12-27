import { useContext } from "react";
import { KeyboardContext } from "../../context/KeyboardState.context";
import { keyboardKeyAndStateMock } from "./constants/mock";

export const KeyboardInfo = () => {
    const { setIsVisibleKeyboardInfo } = useContext(KeyboardContext);

    return (
        <section className="fixed left-0 top-0 flex items-center justify-center w-screen h-screen bg-[rgba(0,0,0,0.55)] z-20">
            <div className="flex flex-col w-100 min-h-50">
                <header className="w-full h-10 bg-main flex items-center justify-between px-3">
                    <p>키보드 이벤트</p>
                    <button
                        onClick={() => setIsVisibleKeyboardInfo(false)}
                        className="cursor-pointer"
                    >
                        닫기
                    </button>
                </header>

                <ul className="flex flex-col flex-1 overflow-y-auto bg-main/20 w-full max-h-80 h-[calc(100%-40px)] py-3 px-4 text-[13px]">
                    {keyboardKeyAndStateMock.map((item) => (
                        <li
                            key={item.key}
                            className="text-white flex w-full justify-between h-8"
                        >
                            <span className="flex items-center">
                                {item.label}
                            </span>
                            <span className="flex items-center text-sm">
                                {item.key}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};
