const OUTPUT_LINES = [
    "[vite] connecting...",
    "[vite] connected.",
    "✓ 621 modules transformed.",
    "✓ built in 842ms",
    "[HMR] watching for file changes...",
];

export const OutputTab = () => {
    return (
        <div className="h-full overflow-y-auto scrolls p-3 font-mono text-[11px] text-muted">
            {OUTPUT_LINES.map((line, i) => (
                <div key={i} className="leading-5">
                    {line}
                </div>
            ))}
        </div>
    );
};
