import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * 새 Service Worker 버전 감지 및 업데이트 훅
 * - needRefresh: 새 버전 사용 가능 여부
 * - updateSW:   업데이트 실행 (페이지 새로고침)
 * - dismissUpdate: 알림 닫기 (이번 세션만 무시)
 */
export const usePWAUpdate = () => {
    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            // 1시간마다 새 SW 확인
            if (r) {
                setInterval(() => r.update(), 60 * 60 * 1000);
            }
        },
    });

    const [dismissed, setDismissed] = useState(false);

    // needRefresh 가 바뀔 때 dismissed 초기화
    useEffect(() => {
        if (needRefresh) setDismissed(false);
    }, [needRefresh]);

    return {
        needRefresh: needRefresh && !dismissed,
        updateSW: () => updateServiceWorker(true),
        dismissUpdate: () => setDismissed(true),
    };
};
