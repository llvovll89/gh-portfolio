import { uiText } from "../../utils/uiText";
import { useState } from "react";
import { useCheckedMobileSize } from "../../hooks/useCheckedMobileSize";

const isMarchFirst = () => {
    const now = new Date();
    return now.getMonth() === 2 && now.getDate() === 1;
};

const TaegeukgiSVG = ({ style }: { style?: React.CSSProperties }) => (
    <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" style={style}>
        {/* 흰 배경 */}
        <rect width="90" height="60" fill="white" rx="2" />

        {/*
          * 국가 규격(위키미디어 Flag_of_South_Korea.svg 기준): 3:2 깃면의 대각선 각도 atan(2/3) = 33.69°
          * 태극: 분할선이 건(좌상)–곤(우하) 대각선 위, 위쪽 빨강·아래쪽 파랑, 빨강 머리는 건 쪽·파랑 머리는 곤 쪽
          * 괘: 건 좌상 · 감 우상 · 리 좌하 · 곤 우하, 막대는 각자의 대각선에 수직
          */}
        <g transform="translate(45,30) rotate(33.69)">
            <circle r="14" fill="#CD2E3A" />
            {/* 대각선 아래쪽 파란 반원 */}
            <path d="M -14,0 A 14,14 0 0,0 14,0 Z" fill="#0047A0" />
            {/* 건 쪽 작은 빨간 원 · 곤 쪽 작은 파란 원 → S자 태극 */}
            <circle cx="-7" cy="0" r="7" fill="#CD2E3A" />
            <circle cx="7" cy="0" r="7" fill="#0047A0" />
        </g>

        {/* 건 ☰ 좌상단 - 3 solid bars */}
        <g transform="translate(22.1,14.7) rotate(-56.31)" stroke="#000" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <line x1="-7" y1="-4" x2="7" y2="-4" />
            <line x1="-7" y1="0"  x2="7" y2="0"  />
            <line x1="-7" y1="4"  x2="7" y2="4"  />
        </g>

        {/* 감 ☵ 우상단 - broken / solid / broken */}
        <g transform="translate(67.9,14.7) rotate(56.31)" stroke="#000" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <line x1="-7" y1="-4" x2="-2" y2="-4" />
            <line x1="2"  y1="-4" x2="7"  y2="-4" />
            <line x1="-7" y1="0"  x2="7"  y2="0"  />
            <line x1="-7" y1="4"  x2="-2" y2="4"  />
            <line x1="2"  y1="4"  x2="7"  y2="4"  />
        </g>

        {/* 리 ☲ 좌하단 - solid / broken / solid */}
        <g transform="translate(22.1,45.3) rotate(56.31)" stroke="#000" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <line x1="-7" y1="-4" x2="7"  y2="-4" />
            <line x1="-7" y1="0"  x2="-2" y2="0"  />
            <line x1="2"  y1="0"  x2="7"  y2="0"  />
            <line x1="-7" y1="4"  x2="7"  y2="4"  />
        </g>

        {/* 곤 ☷ 우하단 - 3 broken bars */}
        <g transform="translate(67.9,45.3) rotate(-56.31)" stroke="#000" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <line x1="-7" y1="-4" x2="-2" y2="-4" />
            <line x1="2"  y1="-4" x2="7"  y2="-4" />
            <line x1="-7" y1="0"  x2="-2" y2="0"  />
            <line x1="2"  y1="0"  x2="7"  y2="0"  />
            <line x1="-7" y1="4"  x2="-2" y2="4"  />
            <line x1="2"  y1="4"  x2="7"  y2="4"  />
        </g>
    </svg>
);

const FLAGS = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${5 + ((i * 47 + 11) % 90)}%`,
    duration: `${10 + ((i * 31) % 8)}s`,
    delay: `${(i * 23) % 9}s`,
    width: 26 + ((i * 7) % 14),
}));

export const MarchFirstOverlay = () => {
    const [dismissed, setDismissed] = useState(false);
    const isMobileSize = useCheckedMobileSize();

    // 닫으면 배지와 무한 반복 깃발 애니메이션을 함께 숨김 (WCAG 2.2.2)
    if (!isMarchFirst() || dismissed) return null;

    const visibleFlags = isMobileSize ? FLAGS.slice(0, 6) : FLAGS;

    return (
        <>
            {/* 떠오르는 태극기들 */}
            <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-40">
                {visibleFlags.map((f) => (
                    <div
                        key={f.id}
                        className="absolute bottom-0 select-none"
                        style={{
                            left: f.left,
                            width: f.width,
                            animation: `flagRise ${f.duration} ease-in ${f.delay} infinite`,
                        }}
                    >
                        <TaegeukgiSVG
                            style={{
                                width: "100%",
                                height: "auto",
                                borderRadius: 2,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* 기념 배지 */}
            {!dismissed && (
                <div
                    role="status"
                    className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 rounded-2xl border border-foreground/15 bg-inverse/75 backdrop-blur-md px-4 sm:px-5 py-3 sm:py-3.5 shadow-2xl"
                    style={{ animation: "marchBadgeIn 0.5s ease-out" }}
                >
                    <TaegeukgiSVG
                        style={{
                            width: 38,
                            height: 26,
                            borderRadius: 3,
                            flexShrink: 0,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.45)",
                        }}
                    />
                    <div lang="ko" className="flex flex-col min-w-0">
                        <div className="text-2xs text-muted font-medium tracking-wide">제 {new Date().getFullYear() - 1919}주년</div>
                        <div className="text-sm font-bold text-foreground whitespace-nowrap">3·1절을 기념합니다</div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className="ml-1 flex items-center justify-center w-8 h-8 rounded-full text-muted hover:text-foreground hover:bg-foreground/10 transition-all duration-150 text-base leading-none shrink-0"
                        aria-label={uiText("닫기")}
                    >
                        ×
                    </button>
                </div>
            )}
        </>
    );
};
