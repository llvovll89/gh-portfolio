import type { BlogPost } from "./postMetadata";

const modules = import.meta.glob<BlogPost>(["../content/posts/*.md", "../content/organizingfiles/*.html"], {
    eager: true, query: "?post-search", import: "default",
});
export default Object.values(modules).sort((a, b) => b.date.localeCompare(a.date));
