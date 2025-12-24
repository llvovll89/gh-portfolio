import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Bottom } from "../../components/footer/Footer";
import { Header } from "../../components/header/Header";
import { CommonPageHeader } from "../common/innerHeader/CommonPageHeader";

export const Main = () => {
    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none">
                <CommonPageHeader title="MAIN" />
            </Contents>
            <Bottom />
        </>
    );
};
