import { useState, useEffect } from 'react'
import { FiMessageSquare } from 'react-icons/fi'
import { FaEdit } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'
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
        setLoading(true)
        const unsub = subscribeBlogComments(slug, (list) => {
            setComments(list)
            setLoading(false)
        })
        return unsub
    }, [slug])

    return (
        <section className="mt-12 pt-8 border-t border-zinc-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <FiMessageSquare className="w-5 h-5 text-zinc-500 dark:text-white/50" />
                    <h2 className="text-base font-bold text-zinc-800 dark:text-white/90">
                        댓글
                        {!loading && comments.length > 0 && (
                            <span className="ml-2 text-sm font-normal text-zinc-400 dark:text-white/40">{comments.length}</span>
                        )}
                    </h2>
                </div>
                {!showForm && (
                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-white/6 dark:hover:bg-white/10 text-zinc-600 dark:text-white/60 transition-all"
                    >
                        <FiMessageSquare className="w-3.5 h-3.5" />
                        댓글 작성
                    </button>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-white/10 shrink-0" />
                            <div className="flex-1 space-y-2 pt-1">
                                <div className="h-3 bg-zinc-200 dark:bg-white/10 rounded-full w-24" />
                                <div className="h-3 bg-zinc-100 dark:bg-white/7 rounded-full w-full" />
                                <div className="h-3 bg-zinc-100 dark:bg-white/5 rounded-full w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 && !showForm ? (
                <div className="py-10 flex flex-col items-center gap-3 text-center">
                    <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                        <FiMessageSquare className="w-8 h-8 text-zinc-300 dark:text-white/25" />
                    </div>
                    <p className="text-sm text-zinc-400 dark:text-white/40">첫 번째 댓글을 남겨보세요!</p>
                </div>
            ) : (
                <ul className="space-y-5">
                    {comments.map((c) => {
                        const gradient = getGradient(c.name)
                        const initial = c.name[0]?.toUpperCase() || '?'
                        const dateStr = c.createdAt?.toDate ? relativeTime(c.createdAt.toDate()) : ''

                        return (
                            <li key={c.id} className="group flex gap-3">
                                <div className={`shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                    {initial}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-zinc-800 dark:text-white/90">{c.name}</span>
                                            {dateStr && <span className="text-[11px] text-zinc-400 dark:text-white/35">{dateStr}</span>}
                                        </div>
                                        <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => setEditTarget(c)}
                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:text-primary dark:hover:bg-primary/10 cursor-pointer transition-all"
                                                title="수정"
                                            >
                                                <FaEdit className="w-3 h-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(c)}
                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-400/10 cursor-pointer transition-all"
                                                title="삭제"
                                            >
                                                <MdDelete className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-white/65 whitespace-pre-wrap break-words leading-relaxed">
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
