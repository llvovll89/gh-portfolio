import {useMemo, useState} from "react";
import {HiMail, HiUser, HiChatAlt2, HiRefresh, HiPaperAirplane, HiInformationCircle} from "react-icons/hi";

export const MessageCardForm = () => {
    const EMAIL = import.meta.env.VITE_EMAIL;

    const [name, setName] = useState("");
    const [fromEmail, setFromEmail] = useState("");
    const [message, setMessage] = useState("");

    const mailtoHref = useMemo(() => {
        const subject = `[Portfolio] ${name || "Contact"} (${fromEmail || "no-email"})`;
        const body = `이름: ${name}\n이메일: ${fromEmail}\n\n메시지:\n${message}`;
        return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, [EMAIL, name, fromEmail, message]);

    const handleReset = () => {
        setName("");
        setFromEmail("");
        setMessage("");
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_rgba(0,0,0,0.45)] space-y-5">
            {/* 헤더 */}
            <div className="pb-4 border-b border-white/10">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <HiChatAlt2 className="w-5 h-5 text-primary" />
                    메시지 남기기
                </h2>
                <p className="mt-2 text-sm text-white/70">
                    입력 후 "메일 앱으로 보내기"를 누르면 기본 메일 앱이 열립니다.
                </p>
            </div>

            {/* 폼 필드 */}
            <div className="grid gap-4">
                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/70 flex items-center gap-2">
                        <HiUser className="w-4 h-4 text-primary/70" />
                        이름
                    </span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border border-white/10 bg-gradient-to-br from-black/30 to-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all placeholder:text-white/30"
                        placeholder="홍길동"
                        autoComplete="name"
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/70 flex items-center gap-2">
                        <HiMail className="w-4 h-4 text-primary/70" />
                        회신 받을 이메일
                    </span>
                    <input
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        className="rounded-xl border border-white/10 bg-gradient-to-br from-black/30 to-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all placeholder:text-white/30"
                        placeholder="name@example.com"
                        autoComplete="email"
                        inputMode="email"
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/70 flex items-center gap-2">
                        <HiChatAlt2 className="w-4 h-4 text-primary/70" />
                        메시지
                    </span>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-40 md:min-h-36 resize-y rounded-xl border border-white/10 bg-gradient-to-br from-black/30 to-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all placeholder:text-white/30"
                        placeholder="프로젝트/협업 관련해서 문의드립니다..."
                    />
                </label>

                {/* 버튼 그룹 */}
                <div className="flex flex-wrap gap-3 justify-end pt-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-xl border border-white/10 bg-gradient-to-r from-black/30 to-black/10 px-4 py-2.5 text-sm font-medium text-white/80 hover:border-white/20 hover:bg-white/5 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <HiRefresh className="w-4 h-4" />
                        초기화
                    </button>

                    <a
                        href={mailtoHref}
                        className="rounded-xl bg-gradient-to-r from-primary to-primary/80 px-5 py-2.5 text-sm font-semibold text-white hover:from-primary/90 hover:to-primary/70 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <HiPaperAirplane className="w-4 h-4" />
                        메일 앱으로 보내기
                    </a>
                </div>

                {/* 안내 문구 */}
                <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5">
                    <HiInformationCircle className="w-4 h-4 text-primary/70 mt-0.5 shrink-0" />
                    <p className="text-xs text-white/60">
                        폼 전송은 서버로 저장되지 않으며, 메일 앱을 통해 전송됩니다.
                    </p>
                </div>
            </div>
        </div>
    );
};
