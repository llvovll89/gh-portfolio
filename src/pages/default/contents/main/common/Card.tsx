interface Skill {
    title: string;
    skills: {
        name: string;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    }[];
}

export const Card = ({ title, skills }: Skill) => {
    return (
        <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{title}</span>
            <ul className="flex flex-col items-center">
                {skills.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-1">
                        <skill.icon className="w-6 h-6" />
                        <span className="text-sm">{skill.name}</span>
                    </div>
                ))}
            </ul>
        </div>
    )
};