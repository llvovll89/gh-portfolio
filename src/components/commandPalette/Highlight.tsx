// 검색어 일치 구간 강조
export function Highlight({ text, query }: { text: string; query: string }) {
    if (!query) return <>{text}</>
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return <>{text}</>
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-yellow-400/30 text-inherit rounded-sm">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </>
    )
}
