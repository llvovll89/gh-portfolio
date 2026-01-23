export const runCliCommand = (raw: string): string => {
    const input = raw.trim();
    if (!input) return "";

    const [cmd, ...args] = input.split(/\s+/);

    switch (cmd.toLowerCase()) {
        case "help":
            return [
                "사용 가능한 명령어:",
                "  help                 : 도움말",
                "  date                 : 현재 시간",
                "  echo <text>          : 텍스트 출력",
                "  clear                : 출력 비우기",
                "  tip                  : 숨은 팁 보기",
                "",
                "예) echo Hello, I'm Gunho",
            ].join("\n");

        case "date":
            return new Date().toLocaleString("ko-KR");

        case "echo":
            return args.join(" ");

        case "tip":
            return [
                "TIP:",
                "- Ctrl + `  : 터미널 열기/닫기",
                "- Shift + Enter : 줄바꿈(입력 유지)",
            ].join("\n");

        case "clear":
            return ""; // 출력 비움

        default:
            return `command not found: ${cmd}\n(help 를 입력해 사용 가능한 명령어를 확인하세요)`;
    }
};
