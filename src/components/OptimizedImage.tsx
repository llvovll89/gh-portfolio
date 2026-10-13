import { useState, type ImgHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import images from "../generated/images.json";

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string };
export const OptimizedImage = (props: Props) => <ImageContent key={props.src} {...props} />;

function ImageContent({ src, alt, width, height, sizes, srcSet, style, onError, ...props }: Props) {
    const { t } = useTranslation();
    const [failed, setFailed] = useState(false);
    const asset = images[src as keyof typeof images];
    const imageWidth = width ?? asset?.width;
    const imageHeight = height ?? asset?.height;
    if (failed) return <span className={"image-fallback " + (props.className ?? "")} role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} style={style}>{t("feedback.imageUnavailable")}</span>;
    return <img {...props} src={asset?.src ?? src} alt={alt} width={imageWidth} height={imageHeight}
        srcSet={srcSet ?? asset?.srcSet} sizes={sizes ?? (asset ? "100vw" : undefined)} style={style}
        decoding={props.decoding ?? "async"} onError={event => { setFailed(true); onError?.(event); }} />;
}
