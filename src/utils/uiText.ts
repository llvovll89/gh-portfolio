import i18n from "../i18n/i18n";

/** Stable keys keep literal UI translations separate from article content and identifiers. */
export function uiText(text: string): string {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
    return i18n.t("ui." + (hash >>> 0).toString(36), { defaultValue: text });
}
