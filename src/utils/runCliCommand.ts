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
                "  git <command>        : Git 명령 (정보 표시용)",
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
                "- Ctrl + Shift + P : 명령 팔레트",
                "- Shift + Enter : 줄바꿈(입력 유지)",
            ].join("\n");

        case "clear":
            return ""; // 출력 비움

        case "git":
            return handleGitCommand(args);

        default:
            return `command not found: ${cmd}\n(help 를 입력해 사용 가능한 명령어를 확인하세요)`;
    }
};

/**
 * Git 명령 처리 (시뮬레이션)
 */
const handleGitCommand = (args: string[]): string => {
    if (args.length === 0) {
        return [
            "usage: git <command>",
            "",
            "일반적인 Git 명령어:",
            "   status      작업 트리 상태 보기",
            "   log         커밋 로그 보기",
            "   branch      브랜치 목록 보기",
            "   push        원격 저장소로 푸시 (시뮬레이션)",
            "   pull        원격 저장소에서 풀 (시뮬레이션)",
            "   add         변경사항 스테이징 (시뮬레이션)",
            "   commit      커밋 생성 (시뮬레이션)",
        ].join("\n");
    }

    const subCmd = args[0].toLowerCase();

    switch (subCmd) {
        case "status":
            return [
                "On branch main",
                "Your branch is up to date with 'origin/main'.",
                "",
                "Changes not staged for commit:",
                "  (use \"git add <file>...\" to update what will be committed)",
                "        modified:   src/components/...",
                "",
                "no changes added to commit",
            ].join("\n");

        case "log":
            return [
                "commit 5ec95b6 (HEAD -> main)",
                "Author: llvovll89",
                "Date:   " + new Date().toLocaleString("ko-KR"),
                "",
                "    chore: 포스팅 추가",
                "",
                "commit 97f44b4",
                "Author: llvovll89",
                "Date:   " + new Date(Date.now() - 86400000).toLocaleString("ko-KR"),
                "",
                "    chore: 블로그포스팅 추가",
            ].join("\n");

        case "branch":
            return ["* main", "  feature/footer-cli", "  develop"].join("\n");

        case "push":
            return [
                "Enumerating objects: 5, done.",
                "Counting objects: 100% (5/5), done.",
                "Delta compression using up to 8 threads",
                "Compressing objects: 100% (3/3), done.",
                "Writing objects: 100% (3/3), 1.2 KiB | 1.2 MiB/s, done.",
                "Total 3 (delta 2), reused 0 (delta 0)",
                "To github.com:username/gh-portfolio.git",
                "   5ec95b6..a1b2c3d  main -> main",
                "",
                "✓ Push 완료 (시뮬레이션)",
            ].join("\n");

        case "pull":
            return [
                "remote: Enumerating objects: 5, done.",
                "remote: Counting objects: 100% (5/5), done.",
                "remote: Total 3 (delta 0), reused 0 (delta 0)",
                "Unpacking objects: 100% (3/3), done.",
                "From github.com:username/gh-portfolio",
                "   5ec95b6..a1b2c3d  main       -> origin/main",
                "Updating 5ec95b6..a1b2c3d",
                "Fast-forward",
                " README.md | 2 +-",
                " 1 file changed, 1 insertion(+), 1 deletion(-)",
                "",
                "✓ Pull 완료 (시뮬레이션)",
            ].join("\n");

        case "add":
            if (args.length === 1) {
                return "Nothing specified, nothing added.\nMaybe you wanted to say 'git add .'?";
            }
            return `✓ 변경사항이 스테이징 영역에 추가되었습니다: ${args.slice(1).join(" ")}`;

        case "commit":
            const messageFlag = args.findIndex((arg) => arg === "-m");
            if (messageFlag === -1) {
                return [
                    "Aborting commit due to empty commit message.",
                    "힌트: 'git commit -m \"message\"' 형식으로 사용하세요",
                ].join("\n");
            }
            const message = args.slice(messageFlag + 1).join(" ").replace(/['"]/g, "");
            return [
                "[main a1b2c3d] " + (message || "empty message"),
                " 3 files changed, 42 insertions(+), 8 deletions(-)",
                "",
                "✓ 커밋이 생성되었습니다 (시뮬레이션)",
            ].join("\n");

        case "diff":
            return [
                "diff --git a/src/components/Cli.tsx b/src/components/Cli.tsx",
                "index 1234567..abcdefg 100644",
                "--- a/src/components/Cli.tsx",
                "+++ b/src/components/Cli.tsx",
                "@@ -1,5 +1,7 @@",
                " import { useContext } from 'react';",
                "+import { KeyboardContext } from '../context';",
                " ",
                " export const Cli = () => {",
                "+  const { setSubmitCliCommand } = useContext(KeyboardContext);",
                "   return (",
            ].join("\n");

        default:
            return `git: '${subCmd}' is not a git command. See 'git --help'.`;
    }
};
