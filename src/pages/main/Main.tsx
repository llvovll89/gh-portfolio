import { Aside } from "./contents/aside";
import { Bottom } from "./contents/bottom";
import { Header } from "./contents/header";

export const Main = () => {
    return (
        <section className="w-screen min-h-screen flex flex-col relative bg-main">
            <Header />
            <Aside />
            <Bottom />
        </section>
    );
};
