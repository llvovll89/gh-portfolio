interface KeyboardKeyAndState {
    key: string;
    label: string;
}

export const keyboardKeyAndStateMock: KeyboardKeyAndState[] = [
    {
        key: "Ctrl + Y",
        label: "폴더 열기/닫기",
    },
    {
        key: "Ctrl + F",
        label: "검색 열기/닫기",
    },
    {
        key: "Ctrl + B",
        label: "사이드바 토글",
    },
    {
        key: "Ctrl + `",
        label: "푸터 터미널 열기/닫기",
    },
    {
        key: "Ctrl + J",
        label: "하단 패널 토글",
    },
    {
        key: "Ctrl + Shift + P",
        label: "명령 팔레트 열기",
    },
    {
        key: "Ctrl + F12",
        label: "키보드 단축키 정보 모달 열기/닫기",
    },
    {
        key: "Enter",
        label: "입력창 입력 후 실행",
    },
    {
        key: "Escape (2번 연속)",
        label: "모든 모달/입력 모드 닫기",
    },
    {
        key: "Tab / Shift + Tab",
        label: "포커스 이동 (순방향 / 역방향)",
    },
    {
        key: "↑ / ↓",
        label: "목록 항목 이동",
    },
];
