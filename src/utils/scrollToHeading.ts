// Detail 페이지 스크롤 컨테이너 내에서 특정 헤딩으로 부드럽게 이동
export function scrollToHeading(id: string, containerId: string, offset = 80) {
    const heading = document.getElementById(id);
    const container = document.getElementById(containerId);
    if (!heading || !container) return;

    const containerRect = container.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    const top = headingRect.top - containerRect.top + container.scrollTop - offset;
    container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}
