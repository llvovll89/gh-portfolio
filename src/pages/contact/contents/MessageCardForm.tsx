import {useMemo, useState} from "react";

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
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-5 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_rgba(0,0,0,0.45)]">
            <h2 className="text-xl font-bold">메시지 남기기</h2>
            <p className="mt-2 text-sm text-white/70">
                입력 후 “메일 앱으로 보내기”를 누르면 기본 메일 앱이 열립니다.
            </p>

            <div className="mt-4 grid gap-3">
                <label className="grid gap-1">
                    <span className="text-xs text-white/50">이름</span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-2xl border border-white/10 bg-black/20 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/70"
                        placeholder="홍길동"
                        autoComplete="name"
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-xs text-white/50">
                        회신 받을 이메일
                    </span>
                    <input
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        className="rounded-2xl border border-white/10 bg-black/20 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/70"
                        placeholder="name@example.com"
                        autoComplete="email"
                        inputMode="email"
                    />
                </label>

                <label className="grid gap-1">
                    <span className="text-xs text-white/50">메시지</span>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-40 md:min-h-33.5 resize-y rounded-2xl border border-white/10 bg-black/20 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/70"
                        placeholder="프로젝트/협업 관련해서 문의드립니다..."
                    />
                </label>

                <div className="flex flex-wrap gap-2 justify-end pt-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition active:scale-[0.99]"
                    >
                        초기화
                    </button>

                    <a
                        href={mailtoHref}
                        className="rounded-2xl bg-primary/85 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary transition active:scale-[0.99]"
                    >
                        메일 앱으로 보내기
                    </a>
                </div>

                <p className="text-xs text-white/45 pt-1">
                    * 폼 전송은 서버로 저장되지 않으며, 메일 앱을 통해
                    전송됩니다.
                </p>
            </div>
        </div>
    );
};
