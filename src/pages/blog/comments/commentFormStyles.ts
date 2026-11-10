// 댓글 위젯 공용 스타일 — 포커스 표시는 위젯 테두리 한 곳에서만 (내부 입력칸은 테두리·outline 없음)

/** 위젯 외곽: 평소 input-line(3:1), 포커스 시 accent 로 바뀌고 1px 안쪽 그림자로 두께만 보강 → 한 줄로 보임 */
export const widgetFrame = (invalid: boolean) => [
    "rounded-lg border bg-panel transition-[border-color,box-shadow] duration-150",
    invalid
        ? "border-error shadow-[inset_0_0_0_1px_var(--error)]"
        : "border-input-line focus-within:border-primary focus-within:shadow-[inset_0_0_0_1px_var(--accent)]",
].join(" ");

/**
 * 위젯 안쪽 입력 요소: 자체 테두리·outline 없이 위젯 프레임이 포커스를 대신 표시
 * (전역 :focus-visible outline 은 레이어 밖 CSS 라 우선순위가 높아 important 로 해제)
 */
const fieldBase = "text-foreground placeholder:text-muted outline-none! focus-visible:outline-none!";
export const bareField = `${fieldBase} bg-transparent`;

/**
 * 하단 바의 작은 입력칸: 옅은 경계로 영역만 구분하고 포커스 시 색을 바꾸지 않음 (포커스는 위젯 테두리 한 곳에서만 표시)
 * 잘못 입력된 칸만 error 경계로 구분
 */
export const inlineField = `${fieldBase} min-w-0 rounded-md border border-line bg-surface px-2 py-1 text-sm aria-invalid:border-error`;

export const primaryButton =
    "inline-flex min-h-8 items-center justify-center rounded-md bg-primary px-3.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer";

export const ghostButton =
    "inline-flex min-h-8 items-center justify-center rounded-md px-3 text-sm text-muted transition-colors hover:bg-foreground/6 hover:text-foreground cursor-pointer";

export const dangerButton =
    "inline-flex min-h-8 items-center justify-center rounded-md bg-error px-3.5 text-sm font-semibold text-inverse transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer";
