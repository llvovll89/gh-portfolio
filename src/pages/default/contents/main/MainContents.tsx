import {CONTACT, PROJECTS} from "../../../../routes/route";
import {useHandlePushPath} from "../../../../hooks/useHandlePushPath";

export const MainContents = () => {
    const handlePushPath = useHandlePushPath();
    const commonButtonStyle =
        "px-4 py-2 rounded cursor-pointer border border-gray-300 text-white hover:bg-primary/80 hover:scale-105 transition-transform duration-300 hover:border-primary/80";

    return (
        <section className="w-full flex h-[calc(100%-76px)] items-center justify-center gap-10">
            <article className="flex flex-col gap-6 w-full h-full justify-center z-10 px-20">
                <div className="flex gap-2 leading-none flex-col">
                    <h1 className="text-5xl md:text-6xl font-bold">
                        Hi, My name is
                    </h1>
                    <span className="text-3xl md:text-4xl text-primary font-bold">
                        Geonho Kim
                    </span>
                </div>

                <div className="flex flex-col leading-relaxed">
                    <p>저의 웹 사이트에 오신 것을 환영합니다.</p>
                    <p>
                        이곳은 제가 개발한 프로젝트와 기술 블로그를 공유하는
                        공간입니다.
                    </p>
                    <p>
                        다양한 기술 스택과 개발 경험을 바탕으로 유용한 정보를
                        제공하고자 합니다.
                    </p>
                    <p>
                        편안하게 둘러보시고 궁금한 점이 있으면 언제든지 연락
                        주세요!
                    </p>
                </div>

                <div className="mt-2 flex gap-3">
                    <button
                        onClick={() => handlePushPath(PROJECTS)}
                        className={commonButtonStyle}
                    >
                        Projects
                    </button>
                    <button
                        onClick={() => handlePushPath(CONTACT)}
                        className={commonButtonStyle}
                    >
                        Contact
                    </button>
                </div>
            </article>
        </section>
    );
};
