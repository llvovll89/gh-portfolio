interface SKill {
    type: keyof typeof SkillType;
    name: string;
    icon: string;
}

export const SkillType = {
    FRONTEND: 'FrontEnd Skills',
    BACKEND: 'BackEnd Skills',
    OTHER: 'Other Skills',
} as const;

export const Skills: SKill[] = [
    {
        type: 'FRONTEND',
        name: 'React',
        icon: 'FaReact',
    },
    {
        type: 'FRONTEND',
        name: 'JavaScript',
        icon: 'IoLogoJavascript',
    },
    {
        type: 'FRONTEND',
        name: 'Tailwind CSS',
        icon: 'RiTailwindCssFill',
    },
    {
        type: 'BACKEND',
        name: 'Spring Boot',
        icon: 'BiLogoSpringBoot',
    },
    {
        type: 'BACKEND',
        name: 'PostgreSQL',
        icon: 'BiLogoPostgresql',
    },
    {
        type: 'BACKEND',
        name: 'Java',
        icon: 'FaJava',
    },
    {
        type: 'OTHER',
        name: 'GitHub',
        icon: 'FaGithub',
    },
];