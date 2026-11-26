/** 텍스트를 파일로 내려받게 함 (CLI 출력·세션 내보내기 공용) */
export function downloadTextFile(content: string, fileName: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // click() 직후 바로 해제하면 일부 브라우저(Safari·구형 Firefox)에서 다운로드가 시작되기 전에 URL 이 사라져 취소되므로 지연 해제
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
