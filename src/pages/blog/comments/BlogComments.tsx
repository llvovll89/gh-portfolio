import { useState, useEffect } from 'react'
import { LuMessageSquare, LuPencil, LuTrash2 } from 'react-icons/lu'
import { subscribeBlogComments, type BlogComment } from '@/utils/blogComments'
import { getGradient, relativeTime } from './blogCommentUtils'
import { CommentForm } from './CommentForm'
import { EditModal } from './EditModal'
import { DeleteModal } from './DeleteModal'

type Props = { slug: string }

export function BlogComments({ slug }: Props) {
    const [comments, setComments] = useState<BlogComment[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState<BlogComment | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<BlogComment | null>(null)

    useEffect(() => {
        // slug가 바뀔 때마다 새 구독을 시작하기 전 로딩 상태로 되돌리는 동기화이므로 effect가 적절함
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true)
        const unsub = subscribeBlogComments(slug, (list) => {
            setComments(list)
            setLoading(false)
        })
        return unsub
    }, [slug])

    return (
        <section className="mt-12 pt-8 border-t border-foreground/15">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <LuMessageSquare className="w-5 h-5 text-muted" />
                    <h2 className="text-base font-bold text-foreground">
                        댓글
                        {!loading && comments.length > 0 && (
                            <span className="ml-2 text-sm font-normal text-muted">{comments.length}</span>
                        )}
                    </h2>
                </div>
                {!showForm && (
                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium px-3 py-1.5 rounded-lg bg-foreground/6 hover:bg-foreground/10 text-muted transition-all"
                    >
                        <LuMessageSquare className="w-3.5 h-3.5" />
                        댓글 작성
                    </button>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="w-9 h-9 rounded-full bg-foreground/10 shrink-0" />
                            <div className="flex-1 space-y-2 pt-1">
                                <div className="h-3 bg-foreground/10 rounded-full w-24" />
                                <div className="h-3 bg-foreground/8 rounded-full w-full" />
                                <div className="h-3 bg-foreground/6 rounded-full w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 && !showForm ? (
                <div className="py-10 flex flex-col items-center gap-3 text-center">
                    <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10">
                        <LuMessageSquare className="w-8 h-8 text-muted" />
                    </div>
                    <p className="text-sm text-muted">첫 번째 댓글을 남겨보세요!</p>
                </div>
            ) : (
                <ul className="space-y-5">
                    {comments.map((c) => {
                        const gradient = getGradient(c.name)
                        const initial = c.name[0]?.toUpperCase() || '?'
                        const dateStr = c.createdAt?.toDate ? relativeTime(c.createdAt.toDate()) : ''

                        return (
                            <li key={c.id} className="group flex gap-3">
                                <div className={`shrink-0 w-9 h-9 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center text-foreground font-bold text-sm shadow-sm`}>
                                    {initial}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-foreground">{c.name}</span>
                                            {dateStr && <span className="text-[11px] text-muted">{dateStr}</span>}
                                        </div>
                                        <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => setEditTarget(c)}
                                                className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 cursor-pointer transition-all"
                                                title="수정"
                                            >
                                                <LuPencil className="w-3 h-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(c)}
                                                className="p-1.5 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-400/10 cursor-pointer transition-all"
                                                title="삭제"
                                            >
                                                <LuTrash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted whitespace-pre-wrap break-words leading-relaxed">
                                        {c.message}
                                    </p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}

            {showForm && (
                <CommentForm slug={slug} onClose={() => setShowForm(false)} />
            )}

            {editTarget && (
                <EditModal
                    slug={slug}
                    comment={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSuccess={() => setEditTarget(null)}
                />
            )}

            {deleteTarget && (
                <DeleteModal
                    slug={slug}
                    comment={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onSuccess={() => setDeleteTarget(null)}
                />
            )}
        </section>
    )
}
