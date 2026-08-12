import {useState} from "react";

interface ImgProps {
    src: string;
    alt?: string;
    className?: string;
    fallbackSrc?: string;
    showSkeleton?: boolean;
}

export const Img = ({
    src,
    alt,
    className,
    fallbackSrc,
    showSkeleton = false,
}: ImgProps) => {
    const [errored, setErrored] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const currentSrc = errored && fallbackSrc ? fallbackSrc : src;

    return (
        <span className="relative inline-block w-full h-full">
            {showSkeleton && !loaded && (
                <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[inherit] bg-white/5 animate-[skeleton-shimmer_1.5s_ease-in-out_infinite]"
                />
            )}
            <img
                onDragStart={(e) => e.preventDefault()}
                src={currentSrc}
                alt={alt}
                className={`${className ?? ""} ${showSkeleton && !loaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                loading="lazy"
                decoding="async"
                onLoad={() => setLoaded(true)}
                onError={() => {
                    if (!errored) setErrored(true);
                    setLoaded(true);
                }}
            />
        </span>
    );
};
