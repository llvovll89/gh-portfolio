interface KeyboardKeyAndState {
    key: string;
    label: string;
}

export const keyboardKeyAndStateMock: KeyboardKeyAndState[] = [
    {
        key: "Ctrl + Y",
        label: "폴더 열기"
    },
    {
        key: "Ctrl + F",
        label: "검색 열기"
    },
    {
        key: "Ctrl + `",
        label: "푸터 열기/닫기"
    },
    {
        key: "Ctrl + F12",
        label: "키보드 단축키 정보 모달 열기/닫기"
    },
    {
        key: "Ctrl + Enter",
        label: "입력창 입력 후 실행"
    },
    {
        key: "Escape (2번 연속)",
        label: "모든 모달/입력 모드 닫기"
    }
]