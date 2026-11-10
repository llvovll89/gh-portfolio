export function initGa(measurementId: string): void {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    // gtag.js 는 배열이 아닌 arguments 객체가 push 돼야 명령으로 인식함 (rest 배열을 넣으면 이벤트가 무시됨)
    window.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
    };
    // 광고 관련 저장소는 사용하지 않음 (Consent Mode v2 기본값)
    window.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'granted',
    });
    window.gtag('js', new Date());
    // 페이지뷰는 usePageTracking 에서 라우트 변경마다 1회만 전송 (초기 자동 전송과 중복 방지)
    window.gtag('config', measurementId, { send_page_view: false });
}
