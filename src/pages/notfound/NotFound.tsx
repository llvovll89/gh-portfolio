import { useContext } from "react";
import { GlobalStateContext } from "../../context/GlobalState.context";
import { Link } from "react-router-dom";

export const NotFound = () => {
    const { selectedTheme } = useContext(GlobalStateContext);

    return (
        <section className={`w-screen h-screen flex items-center justify-center text-red-500 font-bold select-none ${selectedTheme.mode} bg-no-repeat bg-center`}>
            <div
                className="absolute inset-0 opacity-20 bg-no-repeat bg-center"
                style={{
                    backgroundImage: "url('/assets/logo/GH_logo_small_white.png')",
                    backgroundSize: '35%'
                }}
            />

            <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="relative z-10 flex flex-col gap-6 items-center text-center px-4">
                <div className="relative">
                    <h1 className={`text-[180px] font-black leading-none`}>
                        404
                    </h1>
                    <span className="text-6xl font-bold text-red-500">NOT FOUND</span>
                </div>

                <div className={`flex flex-col gap-2 text-white`}>
                    <p className="text-2xl font-semibold">페이지를 찾을 수 없습니다</p>
                    <p className="text-lg">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
                </div>

                <Link
                    to="/"
                    className="mt-4 px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg 
                             transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                    홈으로 돌아가기
                </Link>
            </div>
        </section>
    );
};
