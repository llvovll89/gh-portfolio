/** BlogCard 레이아웃과 동일한 구조의 Skeleton */
export const BlogCardSkeleton = () => (
    <li className="list-none">
        <div
            className={[
                "relative flex flex-col sm:flex-row sm:items-center overflow-hidden rounded-xl border",
                "border-zinc-200/80 dark:border-zinc-800/50",
                "px-4 py-4 sm:px-6 sm:py-5",
            ].join(" ")}
        >
            {/* 왼쪽 메타 영역 */}
            <div className="flex flex-col gap-2.5 sm:min-w-35 pb-3 sm:pb-0 sm:pr-6 border-b sm:border-b-0 sm:border-r border-zinc-200/60 dark:border-zinc-700/60">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-2.5 w-14 rounded" />
                <div className="skeleton h-2.5 w-10 rounded" />
                <div className="flex gap-1.5">
                    <div className="skeleton h-4 w-12 rounded" />
                    <div className="skeleton h-4 w-10 rounded" />
                </div>
            </div>

            {/* 오른쪽 콘텐츠 영역 */}
            <div className="flex-1 pt-3 sm:pt-0 sm:pl-6 space-y-2.5">
                {/* 제목 */}
                <div className="skeleton h-5 w-3/4 rounded" />
                {/* 요약 2줄 */}
                <div className="skeleton h-3.5 w-full rounded" />
                <div className="skeleton h-3.5 w-5/6 rounded" />
            </div>
        </div>
    </li>
);

const SKELETON_COUNT = 6;

export const BlogListSkeleton = () => (
    <ul className="flex flex-col gap-3 pb-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <BlogCardSkeleton key={i} />
        ))}
    </ul>
);
