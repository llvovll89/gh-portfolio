import { BiLogoPostgresql, BiLogoSpringBoot } from "react-icons/bi";
import { FaGithub, FaJava, FaReact } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io";
import { RiTailwindCssFill } from "react-icons/ri";
import { Card } from "./common/Card";

export const MainContents = () => {
    return (
        <section className="w-full flex h-[calc(100%-76px)] items-center justify-center gap-10">
            <article className="flex-1 flex h-[90%] flex-col gap-2 border border-sub-navy p-4 rounded-lg shadow-lg">
                <div className="w-full h-10 mb-10 flex items-center justify-center border-b border-sub-navy">
                    <h2 className="text-2xl font-bold">Skills</h2>
                </div>
                <div>
                    <div className="w-full grid grid-cols-2 gap-2">
                        <Card title="FrontEnd Skills" skills={[
                            { name: 'React', icon: FaReact },
                            { name: 'JavaScript', icon: IoLogoJavascript },
                            { name: 'Tailwind CSS', icon: RiTailwindCssFill },
                        ]} />
                        <Card title="BackEnd Skills" skills={[
                            { name: 'Spring Boot', icon: BiLogoSpringBoot },
                            { name: 'PostgreSQL', icon: BiLogoPostgresql },
                            { name: 'Java', icon: FaJava },
                        ]} />
                    </div>

                    <Card title="Other Skills" skills={[
                        { name: 'GitHub', icon: FaGithub },
                    ]} />
                </div>
            </article>
            <article className="flex-1">
                <span>작업중...</span>
            </article>
        </section >
    )
};