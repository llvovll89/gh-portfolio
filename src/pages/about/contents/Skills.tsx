import {FaJava, FaReact} from "react-icons/fa";
import {RiTailwindCssFill} from "react-icons/ri";
import {SiPostgresql, SiRedux, SiSpring} from "react-icons/si";
import {TbBrandTypescript} from "react-icons/tb";

export const Skills = () => {
    return (
        <article className="w-full flex flex-col gap-2">
            <div className="flex items-center gap-5 mt-5">
                <div className="w-80 h-px bg-white" />
                <h1 className="text-3xl font-bold text-primary">Skills</h1>
            </div>

            <ul className="w-full flex items-center gap-4">
                <li className="flex-1 bg-yellow-300/80 py-1 px-2 rounded-md text-[14px] font-semibold">
                    <span className="font-bold">FrontEnd</span>

                    <ul className="flex items-center gap-2 text-[14px]">
                        <li className="flex items-center gap-1">
                            <FaReact className="w-5 h-5"/>
                            <span>React</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <TbBrandTypescript className="w-5 h-5"/>
                            <span>TypeScript</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <SiRedux className="w-5 h-5"/>
                            <span>Redux</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <RiTailwindCssFill className="w-5 h-5"/>
                            <span>TailwindCSS</span>
                        </li>
                    </ul>
                </li>
                <li className="flex-1 bg-emerald-500/80 py-1 px-2 rounded-md text-[14px] font-semibold">
                    <span className="font-bold">BackEnd</span>

                    <ul className="flex items-center gap-2 text-[14px]">
                        <li className="flex items-center gap-1">
                            <FaJava className="w-5 h-5"/>
                            <span>JAVA</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <SiSpring className="w-5 h-5"/>
                            <span>SpringBoot</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <SiPostgresql className="w-5 h-5"/>
                            <span>PostgreSQL / Oracle</span>
                        </li>
                    </ul>
                </li>
            </ul>
        </article>
    );
};
