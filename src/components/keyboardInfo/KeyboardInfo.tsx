import {useContext} from "react";
import {KeyboardContext} from "../../context/KeyboardState.context";

export const KeyboardInfo = () => {
    const {setIsVisibleKeyboardInfo} = useContext(KeyboardContext);

    return (
        <section className="fixed left-0 top-0 flex items-center justify-center w-screen h-screen bg-[rgba(0,0,0,0.55)]">
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

                <ul className="flex flex-col flex-1 overflow-y-auto bg-main/20 w-full max-h-80 h-[calc(100%-40px)] py-3 px-4">
                    <li className="text-white flex w-full justify-between h-10">
                        <span className="flex items-center">폴더 열기</span>
                        <span className="flex items-center text-sm">
                            Ctrl + Y
                        </span>
                    </li>
                    <li className="text-white flex w-full justify-between h-10">
                        <span className="flex items-center">검색 열기</span>
                        <span className="flex items-center text-sm">
                            Ctrl + F
                        </span>
                    </li>
                    <li className="text-white flex w-full justify-between h-10">
                        <span className="flex items-center">
                            푸터 열기/닫기
                        </span>
                        <span className="flex items-center text-sm">
                            Ctrl + `
                        </span>
                    </li>
                    <li className="text-white flex w-full justify-between h-10">
                        <span className="flex items-center">
                            키보드 단축키 정보 모달 열기/닫기
                        </span>
                        <span className="flex items-center text-sm">
                            Ctrl + F12
                        </span>
                    </li>
                </ul>
            </div>
        </section>
    );
};
