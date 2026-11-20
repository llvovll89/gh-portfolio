import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 같은 제목인 페이지로 이동해 제목 변경이 일어나지 않을 때 기다리는 최대 시간
const TITLE_WAIT_MS = 1500;

export function usePageTracking() {
    const location = useLocation();
    useEffect(() => {
        if (typeof window.gtag !== 'function') return;
        const path = location.pathname;
        const href = window.location.href;
        const previousTitle = document.title;
        let sent = false;
        // lazy 라우트는 이 effect 보다 늦게 useSeoMeta 로 제목을 바꾸므로, 제목이 바뀐 뒤에 page_view 를 보냄
        const send = () => {
            if (sent) return;
            sent = true;
            window.gtag?.('event', 'page_view', { page_path: path, page_location: href, page_title: document.title });
        };
        const observer = new MutationObserver(() => {
            if (document.title !== previousTitle) send();
        });
        observer.observe(document.head, { childList: true, subtree: true, characterData: true });
        const timer = window.setTimeout(send, TITLE_WAIT_MS);
        return () => {
            observer.disconnect();
            window.clearTimeout(timer);
            // 제목이 바뀌기 전에 다시 이동해도 방문 기록은 남김
            send();
        };
    }, [location.pathname]);
}
