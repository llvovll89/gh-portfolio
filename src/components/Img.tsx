interface ImgProps {
    src: string;
    alt?: string;
    className?: string;
}

export const Img = ({src, alt, className}: ImgProps) => {
    const stopDragging = (e: React.DragEvent<HTMLImageElement>) => {
        e.preventDefault();
    };

    return (
        <img
            onDragStart={stopDragging}
            src={src}
            alt={alt}
            className={className}
        />
    );
};
