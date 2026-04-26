import { escapeRegExp } from "./searchUtils";

export function HighlightedText({ text, keywords }: { text: string; keywords: string[] }) {
    const active = keywords.filter(Boolean);
    if (!active.length) return <>{text}</>;

    const sorted = [...active].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`(${sorted.map(escapeRegExp).join("|")})`, "ig");
    const parts = text.split(pattern);

    return (
        <>
            {parts.map((part, idx) => {
                const isHit = sorted.some((k) => k.toLowerCase() === part.toLowerCase());
                return isHit ? (
                    <mark key={idx} className="bg-primary/30 text-white px-0.5 rounded-sm">
                        {part}
                    </mark>
                ) : (
                    <span key={idx}>{part}</span>
                );
            })}
        </>
    );
}
