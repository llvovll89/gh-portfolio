// 구조화 데이터(JSON-LD)의 Person — 빌드 프리렌더(build/seo.ts)와 클라이언트(useSeoMeta)가 같은 값을 쓰도록 단일 원본으로 관리
export const SITE_URL = "https://kimgeonho.vercel.app";

export const personSchema = {
    "@type": "Person",
    "@id": SITE_URL + "/#person",
    name: "김건호",
    alternateName: "Geonho Kim",
    url: SITE_URL,
    image: SITE_URL + "/assets/images/kimgeonho/" + encodeURIComponent("증명사진.png"),
    jobTitle: "Full-stack Web Developer",
    worksFor: { "@type": "Organization", name: "나노IT" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "대구대학교" },
    knowsAbout: ["React", "TypeScript", "Tailwind CSS", "Vite", "Firebase", "Spring Boot", "JPA", "PostgreSQL", "Oracle"],
    sameAs: ["https://github.com/llvovll89"],
};
