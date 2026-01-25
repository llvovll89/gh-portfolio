export const Title = () => {
    return (
        <article className="w-full flex items-center md:gap-5 gap-2 mt-5">
            <div className="flex-1 md:flex-none md:w-100 h-px bg-white" />
            <h1 className="w-max shrink-0 whitespace-nowrap text-[clamp(1.2rem,2.5vw,3rem)] font-bold text-primary pr-2">
                About Me
            </h1>
        </article>
    );
};