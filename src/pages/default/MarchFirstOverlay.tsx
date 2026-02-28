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

        {/* 태극 - yin-yang을 -45° 회전 */}
        <g transform="translate(45,30) rotate(-45)">
            {/* 빨간 원 전체 */}
            <circle r="14" fill="#CD2E3A" />
            {/* 아래쪽 파란 반원 */}
            <path d="M -14,0 A 14,14 0 0,0 14,0 Z" fill="#003478" />
            {/* 하단 작은 빨간 원 (파란 영역 안) */}
            <circle cx="0" cy="7" r="7" fill="#CD2E3A" />
            {/* 상단 작은 파란 원 (빨간 영역 안) */}
            <circle cx="0" cy="-7" r="7" fill="#003478" />
        </g>

        {/* 건 ☰ 좌상단 - 3 solid bars */}
        <g transform="translate(16,12) rotate(-45)" stroke="#000" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <line x1="-7" y1="-4" x2="7" y2="-4" />
            <line x1="-7" y1="0"  x2="7" y2="0"  />
            <line x1="-7" y1="4"  x2="7" y2="4"  />
        </g>

        {/* 이 ☲ 우상단 - solid / broken / solid */}
        <g transform="translate(74,12) rotate(45)" stroke="#000" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <line x1="-7" y1="-4" x2="7"  y2="-4" />
            <line x1="-7" y1="0"  x2="-2" y2="0"  />
            <line x1="2"  y1="0"  x2="7"  y2="0"  />
            <line x1="-7" y1="4"  x2="7"  y2="4"  />
        </g>

        {/* 감 ☵ 좌하단 - broken / solid / broken */}
        <g transform="translate(16,48) rotate(45)" stroke="#000" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <line x1="-7" y1="-4" x2="-2" y2="-4" />
            <line x1="2"  y1="-4" x2="7"  y2="-4" />
            <line x1="-7" y1="0"  x2="7"  y2="0"  />
            <line x1="-7" y1="4"  x2="-2" y2="4"  />
            <line x1="2"  y1="4"  x2="7"  y2="4"  />
        </g>

        {/* 곤 ☷ 우하단 - 3 broken bars */}
        <g transform="translate(74,48) rotate(-45)" stroke="#000" strokeWidth="2.2" strokeLinecap="round" fill="none">
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

    if (!isMarchFirst()) return null;

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
                    className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 rounded-2xl border border-white/15 bg-black/75 backdrop-blur-md px-4 sm:px-5 py-3 sm:py-3.5 shadow-2xl"
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
                    <div className="flex flex-col min-w-0">
                        <div className="text-[10px] text-white/50 font-medium tracking-wide">제 107주년</div>
                        <div className="text-sm font-bold text-white whitespace-nowrap">3·1절을 기념합니다</div>
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="ml-1 flex items-center justify-center w-5 h-5 rounded-full text-white/40 hover:text-white/90 hover:bg-white/10 transition-all duration-150 text-base leading-none shrink-0"
                        aria-label="닫기"
                    >
                        ×
                    </button>
                </div>
            )}
        </>
    );
};
