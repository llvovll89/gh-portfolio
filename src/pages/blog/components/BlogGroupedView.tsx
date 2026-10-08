import type { BlogPost } from "../../../utils/loadPosts";
import { BlogCard } from "../contents/BlogCard";
import { getSortedGroupEntries } from "../../../utils/blogFilters";

interface BlogGroupedViewProps {
    posts: Record<string, BlogPost[]>;
}

export const BlogGroupedView = ({ posts }: BlogGroupedViewProps) => {
    const sortedGroups = getSortedGroupEntries(posts);

    if (sortedGroups.length === 0) {
        return null;
    }

    return (
        <div className="space-y-8">
            {sortedGroups.map(([tag, groupPosts]) => (
                <section key={tag} className="group">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span
                                className={[
                                    "inline-flex items-center px-4 py-2",
                                    "rounded-lg",
                                    "bg-linear-to-r from-primary/10 to-primary/5",
                                    "blog-dark:from-primary/20 blog-dark:to-primary/10",
                                    "border border-primary/20 blog-dark:border-primary/30",
                                    "text-sm font-semibold",
                                    "text-primary blog-dark:text-primary",
                                ].join(" ")}
                            >
                                #{tag}
                            </span>
                            <span className="text-sm text-muted blog-dark:text-muted">
                                {groupPosts.length}{" "}
                                {groupPosts.length === 1 ? "post" : "posts"}
                            </span>
                        </div>
                        <div className="flex-1 h-px bg-panel blog-dark:bg-panel" />
                    </div>

                    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {groupPosts.map((post) => (
                            <BlogCard key={post.slug} p={post} />
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
};
