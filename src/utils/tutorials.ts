export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    expectedCommand: string;
    hint: string;
}

export const CLI_TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: "step-help",
        title: "도움말 확인",
        description: "먼저 help 명령으로 사용 가능한 명령어를 확인해보세요.",
        expectedCommand: "help",
        hint: "입력: help",
    },
    {
        id: "step-echo",
        title: "출력 테스트",
        description: "echo 명령으로 원하는 텍스트를 출력해보세요.",
        expectedCommand: "echo",
        hint: "입력 예시: echo Hello CLI",
    },
    {
        id: "step-date",
        title: "시간 확인",
        description: "date 명령으로 현재 시간을 출력해보세요.",
        expectedCommand: "date",
        hint: "입력: date",
    },
    {
        id: "step-git",
        title: "Git 상태 보기",
        description: "git status 명령으로 저장소 상태를 확인해보세요.",
        expectedCommand: "git status",
        hint: "입력: git status",
    },
    {
        id: "step-clear",
        title: "출력 정리",
        description: "clear 명령으로 출력창을 비워 마무리해보세요.",
        expectedCommand: "clear",
        hint: "입력: clear",
    },
];

export const formatTutorialStep = (index: number): string => {
    const step = CLI_TUTORIAL_STEPS[index];
    if (!step) {
        return "튜토리얼 단계를 찾을 수 없습니다.";
    }

    return [
        `[Tutorial ${index + 1}/${CLI_TUTORIAL_STEPS.length}] ${step.title}`,
        step.description,
        `목표 명령: ${step.expectedCommand}`,
        `힌트: ${step.hint}`,
    ].join("\n");
};

export const isExpectedTutorialCommand = (index: number, rawInput: string): boolean => {
    const step = CLI_TUTORIAL_STEPS[index];
    if (!step) return false;

    const input = rawInput.trim().toLowerCase();
    const expected = step.expectedCommand.toLowerCase();

    if (expected.includes(" ")) {
        return input === expected;
    }

    return input === expected || input.startsWith(`${expected} `);
};
