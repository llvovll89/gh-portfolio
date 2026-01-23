import {useEffect, useState} from "react";

export const CommunicationCard = () => {
    const EMAIL = import.meta.env.VITE_EMAIL;
    const GITHUB = import.meta.env.VITE_GITHUB;

    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const t = window.setTimeout(() => setCopied(false), 1500);
        return () => window.clearTimeout(t);
    }, [copied]);

    const legacyCopy = (text: string) => {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "0";
        ta.style.left = "0";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
    };

    const handleCopyEmail = async () => {
        const text = String(EMAIL ?? "");
        if (!text) return;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                return;
            }
        } catch {
            // 아래 폴백으로 진행
        }

        // 폴백: 일부 로컬/브라우저에서도 동작
        const ok = legacyCopy(text);
        setCopied(ok);
    };
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-5 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold">빠르게 연락하기</h2>
                    <p className="mt-2 text-sm text-white/70">
                        아래 채널로 편하게 연락 주세요.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="cursor-pointer shrink-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white transition active:scale-[0.99]"
                    title="이메일 복사"
                >
                    이메일 복사
                </button>

                {copied && (
                    <div className="absolute top-4 right-0 rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg">
                        이메일이 복사되었습니다!
                    </div>
                )}
            </div>

            {/* 프로필 요약 */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                        <dt className="text-xs text-white/50">이름</dt>
                        <dd className="mt-1 font-semibold">김건호</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-white/50">경력</dt>
                        <dd className="mt-1 font-semibold">2년 7개월</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-white/50">생년월일</dt>
                        <dd className="mt-1 font-semibold">1994-05-04</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-white/50">거주지</dt>
                        <dd className="mt-1 font-semibold">대구광역시</dd>
                    </div>
                </dl>
            </div>

            {/* 채널 카드 */}
            <div className="mt-4 grid gap-3">
                <a
                    href={`mailto:${EMAIL}`}
                    className="group rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/10 transition active:scale-[0.99]"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs text-white/50">Email</p>
                            <p className="mt-1 font-semibold break-all truncate">
                                {EMAIL}
                            </p>
                        </div>
                        <span className="text-xs text-white/60 group-hover:text-white transition">
                            보내기 →
                        </span>
                    </div>
                </a>

                <a
                    href={GITHUB}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/10 transition active:scale-[0.99]"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs text-white/50">GitHub</p>
                            <p className="mt-1 font-semibold break-all truncate">
                                {GITHUB}
                            </p>
                        </div>
                        <span className="text-xs text-white/60 group-hover:text-white transition">
                            열기 →
                        </span>
                    </div>
                </a>
            </div>

            {/* 관심/태그 */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/70">
                    관심 분야{" "}
                    <span className="text-white font-semibold">
                        Frontend / Full-stack
                    </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {["React", "TypeScript", "UI/UX", "Performance"].map(
                        (t) => (
                            <span
                                key={t}
                                className="text-xs text-white/70 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"
                            >
                                {t}
                            </span>
                        ),
                    )}
                </div>
                <p className="text-sm text-white/70 mt-3">
                    협업/채용/사이드프로젝트 문의 모두 환영합니다.
                </p>
            </div>
        </div>
    );
};
