import {Img} from "../../../../components/Img";

export const MainContents = () => {
    return (
        <section className="w-full flex h-[calc(100%-76px)] items-center justify-center gap-10">
            <Img
                src="/assets/logo/GH_logo_small_white.png"
                className="w-40 opacity-80"
            />
        </section>
    );
};
