import { useState } from "react";
import { useTranslation } from "react-i18next";

const TARGETS = [["main-content", "main"], ["main-navigation", "navigation"], ["header-tabs", "tabs"]] as const;
const resolveTarget = (id: string) => document.getElementById(id) ?? (id === "main-content" ? document.getElementById("detail-content") : null);

export const SkipLinks = () => {
    const { t } = useTranslation();
    // 블로그 상세처럼 내비게이션·탭이 없는 화면에서 대상 없는 링크가 노출되지 않도록, 포커스가 들어올 때 실제 존재하는 대상만 남김
    const [available, setAvailable] = useState<readonly string[]>(TARGETS.map(([id]) => id));
    const skip = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        event.preventDefault();
        resolveTarget(id)?.focus({ preventScroll: true });
    };
    return <nav
        aria-label={t("accessibility.skip")}
        className="skip-links"
        onFocus={() => setAvailable(TARGETS.map(([id]) => id).filter(id => id === "main-content" || resolveTarget(id)))}
    >
        {TARGETS.filter(([id]) => available.includes(id)).map(([id, key]) => <a key={id} href={"#" + id} className="skip-link" onClick={event => skip(event, id)}>{t("accessibility." + key)}</a>)}
    </nav>;
};
