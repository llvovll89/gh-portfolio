import {Contents} from "../../components/contents/Contents";
import {Header} from "../../components/header/Header";
import {Aside} from "../../components/aside/Aside";
import {MainContents} from "./contents/main/MainContents";
import {MarchFirstOverlay} from "./MarchFirstOverlay";

export const Default = () => {
    return (
        <>
            <Header />
            <Aside />
            <Contents>
                <MainContents />
            </Contents>
            <MarchFirstOverlay />
        </>
    );
};
