import {Contents} from "../../components/contents/Contents";
import {Header} from "../../components/header/Header";
import {Aside} from "../../components/aside/Aside";
import {MainContents} from "./contents/main/MainContents";

export const Default = () => {
    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none">
                <MainContents />
            </Contents>
        </>
    );
};
