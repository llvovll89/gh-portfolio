import mocks from "@/mocks/MockData.json";
import {useContext, useState} from "react";
import {NOT_FOUND, routesPath} from "../../../../routes/route";
import {GlobalStateContext} from "../../../../context/GlobalState.context";
import {FcOpenedFolder} from "react-icons/fc";
import {useHandlePushPath} from "../../../../hooks/useHandlePushPath";

export const Search = () => {
    const [list, setList] = useState<string[]>([]);
    const {selectedPathState} = useContext(GlobalStateContext);
    const handlePushPath = useHandlePushPath();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.trim();
        // const results = mocks.filter((item) => {
        //     console.log(item.name);
        //     return item.name.toLowerCase().includes(query.toLowerCase());
        // });

        if (!query) {
            setList([]);
            return;
        }

        const keywords = query.split(/\s+/);
        const matched = routesPath
            .filter((route) => route.path !== NOT_FOUND)
            .filter((route) =>
                keywords.some((keyword) =>
                    route.name.toLowerCase().includes(keyword.toLowerCase())
                )
            )
            .map((route) => route.path);

        setList(matched);
    };

    return (
        <section className="w-[calc(100%-40px)] flex flex-col bg-background-main-color overflow-hidden">
            <header className="w-full h-10 px-3 flex items-center text-xs text-white overflow-hidden tracking-[1px]">
                검색
            </header>

            <div className="w-full flex h-10 bg-sub-gary/20 items-center px-3">
                <input
                    onChange={handleInputChange}
                    type="text"
                    placeholder="검색어를 입력하세요"
                    className="focus:border-primary transition-all w-full h-7 bg-background-main-color border border-sub-gary/30 rounded-sm px-2 tracking-wide text-white outline-none text-xs"
                    autoFocus
                />
            </div>

            {/* 검색 결과 리스트 */}
            {list.length > 0 && (
                <div className="w-full h-[calc(100%-80px)] p-2 text-white overflow-y-auto">
                    {routesPath
                        .filter((r) => list.includes(r.path))
                        .map((r) => (
                            <li
                                onClick={() => handlePushPath(r.path)}
                                key={r.path}
                                className={`${
                                    selectedPathState.state === r.path
                                        ? "bg-sub-gary/20"
                                        : ""
                                } w-full h-8 flex items-center px-3 text-white text-sm cursor-pointer hover:bg-primary/20 gap-1`}
                            >
                                <FcOpenedFolder className="w-5 h-5" />
                                {r.name}
                            </li>
                        ))}
                </div>
            )}
        </section>
    );
};
