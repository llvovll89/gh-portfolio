// monitoring.ts 가 동적 import 하는 Sentry 진입점.
// `import("@sentry/react")` 처럼 네임스페이스 전체를 동적 import 하면 tree-shaking 이 안 돼 리플레이·피드백까지 번들되므로
// 실제로 쓰는 함수만 정적으로 골라 내보냄
export { init, captureException, captureReactException } from "@sentry/react";
