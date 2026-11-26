import { slugifyHeading } from "./parseToc";
import { safeDecode } from "./safeDecode";

// 헤딩을 컨테이너 상단에서 이만큼 띄워 멈춤 — 목차 활성 판정 기준도 이 값을 공유
export const HEADING_SCROLL_OFFSET = 80;

/**
 * 앵커(인코딩 여부 무관) → 실제 heading 요소.
 * 글의 수동 목차는 GitHub 식으로 하이픈을 연달아 쓰지만(`1-actions--폼`) 렌더러 id 는 slugifyHeading 으로 합쳐지므로
 * 정확히 일치하는 id 가 없으면 같은 규칙으로 정규화해 다시 찾음
 */
export function findHeading(anchor: string): HTMLElement | null {
    const id = safeDecode(anchor.replace(/^#/, ""));
    if (!id) return null;
    return document.getElementById(id) ?? document.getElementById(slugifyHeading(id));
}

// Detail 페이지 스크롤 컨테이너 내에서 특정 헤딩으로 부드럽게 이동. 대상이 없으면 false
export function scrollToHeading(anchor: string, containerId: string, offset = HEADING_SCROLL_OFFSET): boolean {
    const heading = findHeading(anchor);
    const container = document.getElementById(containerId);
    if (!heading || !container) return false;

    const containerRect = container.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    const top = headingRect.top - containerRect.top + container.scrollTop - offset;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    container.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
    return true;
}
