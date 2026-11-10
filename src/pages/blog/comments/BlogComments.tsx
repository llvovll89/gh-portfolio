import { uiText } from "../../../utils/uiText";
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { subscribeBlogComments, type BlogComment } from '@/utils/blogComments'
import { CommentComposer } from './CommentComposer'
import { CommentItem } from './CommentItem'

type Props = { slug: string }

export function BlogComments({ slug }: Props) {
    const { t } = useTranslation()
    const [failed, setFailed] = useState(false)
    const [attempt, setAttempt] = useState(0)
    const [comments, setComments] = useState<BlogComment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // slug가 바뀔 때마다 새 구독을 시작하기 전 로딩 상태로 되돌리는 동기화이므로 effect가 적절함
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true)
        const unsub = subscribeBlogComments(slug, (list) => {
            setFailed(false)
            setComments(list)
            setLoading(false)
        }, () => { setFailed(true); setLoading(false) })
        return unsub
    }, [slug, attempt])

    return (
        <section aria-labelledby="blog-comments-title" className="mt-12 border-t border-line pt-8">
            <h2 id="blog-comments-title" className="mb-4 flex items-baseline gap-2 text-base font-bold text-foreground">
                {uiText("댓글")}
                {!loading && !failed && <span className="text-sm font-normal tabular-nums text-muted">{comments.length}</span>}
            </h2>

            {failed ? (
                <p role="alert" className="flex flex-wrap items-center gap-3 py-2 text-sm text-muted">
                    {t("comments.loadError")}
                    <button type="button" className="workbench-button" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>{t("feedback.retry")}</button>
                </p>
            ) : (
                <>
                    <CommentComposer mode="create" slug={slug} />

                    <div className="mt-8" aria-busy={loading}>
                        {loading ? (
                            <div className="space-y-5" aria-hidden="true">
                                {[0, 1].map((i) => (
                                    <div key={i} className="flex gap-3 animate-pulse">
                                        <div className="h-7 w-7 shrink-0 rounded-md bg-foreground/10" />
                                        <div className="flex-1 space-y-2 pt-1">
                                            <div className="h-3 w-24 rounded bg-foreground/10" />
                                            <div className="h-3 w-full rounded bg-foreground/8" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : comments.length === 0 ? (
                            <p className="text-sm text-muted">{uiText("아직 댓글이 없어요. 첫 의견을 남겨주세요.")}</p>
                        ) : (
                            <ol className="list-none">
                                {comments.map((c) => <CommentItem key={c.id} slug={slug} comment={c} />)}
                            </ol>
                        )}
                    </div>
                </>
            )}
        </section>
    )
}
