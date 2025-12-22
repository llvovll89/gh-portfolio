import {Img} from "../../../../components/Img";

export const MainContents = () => {
    return (
        <section className="w-full flex h-[calc(100%-76px)] items-center justify-center gap-10">
            <Img
                src="/assets/logo/gh-logo(w).png"
                className="w-120 opacity-80"
            />
        </section>
    );
};
