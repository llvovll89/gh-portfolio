/** 새 탭 열기(Ctrl/Cmd/Shift/Alt·가운데 버튼)는 브라우저 기본 동작에 맡겨야 하므로 일반 좌클릭만 가로챔 */
export function isPlainLeftClick(e: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }) {
    return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
