import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./global.css";
import "./styles/workbench.css";
import { BrowserRouter } from "react-router-dom";
import { i18nReady } from "./i18n/i18n";
import { initGa } from "./utils/gtag";
import { initMonitoring, reactRootErrorHandler } from "./utils/monitoring";

const gaId = import.meta.env.VITE_GA_ID as string | undefined;
if (gaId) {
    initGa(gaId);
} else {
    console.warn("[Analytics] VITE_GA_ID가 없어 GA 초기화를 건너뜁니다.");
}

// 에러(Sentry, DSN 있을 때만)·Web Vitals(GA4) 수집 — SDK 는 첫 화면 이후 지연 로드
initMonitoring();

// en/ja 리소스는 lazy 청크라 로드 완료 후 렌더 (ko는 번들 포함이라 사실상 즉시). 로드 실패 시에도 ko fallback으로 렌더
const renderApp = () => createRoot(document.getElementById("root")!, {
    // 에러 바운더리 밖에서 난 에러와 바운더리가 잡은 에러 모두 보고 (PageErrorBoundary 는 화면 대체만 담당)
    onUncaughtError: reactRootErrorHandler("UncaughtError"),
    onCaughtError: reactRootErrorHandler("CaughtError"),
}).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
void i18nReady.then(renderApp, renderApp);
