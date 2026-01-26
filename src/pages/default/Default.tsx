import {Contents} from "../../components/contents/Contents";
import {Header} from "../../components/header/Header";
import {Aside} from "../../components/aside/Aside";
import {MainContents} from "./contents/main/MainContents";
import {CommonPageHeader} from "../common/innerHeader/CommonPageHeader";

export const Default = () => {
    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none">
                <CommonPageHeader />
                <MainContents />
            </Contents>
        </>
    );
};
