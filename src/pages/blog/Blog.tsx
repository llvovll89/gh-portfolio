import {useMemo} from "react";
import {Aside} from "../../components/aside/Aside";
import {Contents} from "../../components/contents/Contents";
import {Bottom} from "../../components/footer/Footer";
import {Header} from "../../components/header/Header";
import {CommonPageHeader} from "../common/innerHeader/CommonPageHeader";
import {loadPosts} from "../../utils/loadPosts";
import {BlogCard} from "./contents/BlogCard";

export const Blog = () => {
    const posts = useMemo(() => loadPosts(), []);

    return (
        <>
            <Header />
            <Aside />
            <Contents>
                <CommonPageHeader />

                <section className="py-4">
                    <div className="mb-3 flex items-end justify-between gap-3 select-none">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                            포스트
                        </h2>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {posts.length} posts
                        </span>
                    </div>

                    {posts.length === 0 ? (
                        <p className="text-zinc-700 dark:text-zinc-300">
                            아직 글이 없습니다.{" "}
                            <span className="font-mono">src/content/posts</span>
                            에 <span className="font-mono">.md</span> 파일을
                            추가해보세요.
                        </p>
                    ) : (
                        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {posts.map((p) => (
                                <BlogCard key={p.slug} p={p} />
                            ))}
                        </ul>
                    )}
                </section>
            </Contents>
            <Bottom />
        </>
    );
};
