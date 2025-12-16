export const Aside = () => {
    return (
        <aside className="absolute left-0 top-0 w-75 h-screen bg-main border-r border-sub-gary flex flex-col">
            <section className="flex flex-col bg-background-main-color">
                <header className="w-full h-8 px-2 flex items-center text-xs text-white">
                    EXPLORER
                </header>
                <article className="w-full h-[calc(100%-32px)]">

                </article>
            </section>
        </aside>
    )
};