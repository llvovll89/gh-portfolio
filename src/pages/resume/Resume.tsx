import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { HiDocumentDownload } from "react-icons/hi";
import { FaFilePdf } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export const Resume = () => {
    const { t } = useTranslation();

    const handleDownloadResume = async () => {
        let objectUrl: string | null = null;
        let link: HTMLAnchorElement | null = null;
        try {
            const resumeUrl = "/assets/resume/김건호_이력서.pdf";
            const response = await fetch(resumeUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            objectUrl = window.URL.createObjectURL(blob);
            link = document.createElement("a");
            link.href = objectUrl;
            link.download = "김건호_이력서.pdf";
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("이력서 다운로드 실패:", error);
            alert("이력서 다운로드에 실패했습니다.");
        } finally {
            if (link && document.body.contains(link)) document.body.removeChild(link);
            if (objectUrl) window.URL.revokeObjectURL(objectUrl);
        }
    };

    const sections = [
        {
            title: "기본 정보",
            icon: "👤",
            content: [
                { label: "이름", value: "김건호 (Kim Geon Ho)" },
                { label: "생년월일", value: "1994.05.04" },
                { label: "이메일", value: "svvvs5579@naver.com" },
            ],
        },
        {
            title: "경력",
            icon: "💼",
            content: [
                { label: "기간", value: "2023.07 ~ 현재" },
                { label: "직책", value: "FullStack Developer" },
            ],
        },
        {
            title: "학력",
            icon: "🎓",
            content: [
                { label: "고등학교", value: "청구고등학교 졸업 (2013.02)" },
                { label: "대학교", value: "대구대학교 졸업 (2020.02)" },
            ],
        },
                {
                    title: "기술 스택",
                    icon: "⚡",
                    content: [
                        { label: "Frontend", value: "React, TypeScript, Redux, TailwindCSS" },
                        { label: "Backend", value: "Java, SpringBoot, PostgreSQL/Oracle, Firebase" },
                    ],
                },
    ];

    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none">
                <section className="relative w-full max-w-6xl mx-auto overflow-auto scrolls px-2 md:px-6 py-4 md:py-8">
                    {/* 헤더 */}
                    <div className="relative mb-8 md:mb-12">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <FaFilePdf className="w-6 h-6 text-primary" />
                                    </div>
                                    <h1 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-tight text-white/90">
                                        {t("pages.resume.title")}
                                    </h1>
                                </div>
                                <p className="text-sm md:text-base text-white/70 max-w-2xl leading-relaxed">
                                    {t("pages.resume.description")}
                                </p>
                            </div>

                            {/* 다운로드 버튼 */}
                            <button
                                onClick={handleDownloadResume}
                                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-sm md:text-base font-bold transition-all duration-300 bg-linear-to-r from-primary via-blue-500 to-cyan-400 text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2"
                            >
                                <HiDocumentDownload className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                                <span>이력서 다운로드</span>
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </div>

                        {/* 구분선 */}
                        <div className="mt-6 h-px w-full bg-linear-to-r from-transparent via-primary/30 to-transparent" />
                    </div>

                    {/* 이력서 미리보기 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {sections.map((section, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-2xl p-5 md:p-6 bg-linear-to-br from-white/5 to-white/2 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:from-white/8 hover:to-white/4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                            >
                                {/* 배경 효과 */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                                </div>

                                {/* 헤더 */}
                                <div className="relative flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl transition-transform group-hover:scale-110">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-lg md:text-xl font-bold text-white/90">
                                        {section.title}
                                    </h2>
                                </div>

                                {/* 내용 */}
                                <div className="relative space-y-3">
                                    {section.content.map((item, idx) => (
                                        <div key={idx} className="flex flex-col gap-1">
                                            <span className="text-xs md:text-sm text-primary font-semibold">
                                                {item.label}
                                            </span>
                                            <span className="text-xs md:text-sm text-white/80">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* 하단 액센트 */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/40 transition-all duration-300" />
                            </div>
                        ))}
                    </div>

                    {/* 추가 정보 */}
                    <div className="mt-8 md:mt-12 p-5 md:p-6 rounded-2xl bg-linear-to-br from-primary/5 to-primary/2 border border-primary/20">
                        <h3 className="text-base md:text-lg font-bold text-white/90 mb-3 flex items-center gap-2">
                            <span>📌</span>
                            참고사항
                        </h3>
                        <ul className="space-y-2 text-xs md:text-sm text-white/70">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">▹</span>
                                <span>프로젝트 포트폴리오는 Projects 페이지에서 확인하실 수 있습니다.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">▹</span>
                                <span>기술 블로그는 Blog 페이지에서 확인하실 수 있습니다.</span>
                            </li>
                        </ul>
                    </div>
                </section>
            </Contents>
        </>
    );
};
