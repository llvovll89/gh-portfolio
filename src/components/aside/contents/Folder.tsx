import {NOT_FOUND, routesPath} from "../../../routes/route";

export const Folder = () => {
    return (
        <section className="w-[calc(100%-40px)] flex flex-col bg-background-main-color overflow-hidden">
            <header className="w-full h-8 px-2 flex items-center text-xs text-white overflow-hidden">
                EXPLORER
            </header>
            <article className="w-full h-[calc(100%-32px)]">
                {routesPath
                    .filter((r) => r.path !== NOT_FOUND)
                    .map((r) => (
                        <div
                            key={r.path}
                            className="w-full h-6 flex items-center px-3 text-white text-sm cursor-pointer hover:bg-primary/20 user-select-none"
                        >
                            {r.name}
                        </div>
                    ))}
            </article>
        </section>
    );
};
