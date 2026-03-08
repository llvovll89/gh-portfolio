import { useState, useEffect } from 'react'
import { HiUser } from 'react-icons/hi'
import { FiMessageSquare } from 'react-icons/fi'
import { TbLockPassword } from 'react-icons/tb'
import { FaEdit } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'
import { IoClose } from 'react-icons/io5'
import hashPassword from '@/utils/hashPassword'
import {
    subscribeBlogComments,
    addBlogComment,
    updateBlogComment,
    deleteBlogComment,
    type BlogComment,
} from '@/utils/blogComments'

// ── 아바타 그라디언트 ──────────────────────────────────────
const GRADIENTS = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-500',
    'from-indigo-500 to-blue-600',
    'from-fuchsia-500 to-violet-600',
    'from-teal-500 to-emerald-600',
]
function getGradient(name: string) {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

// ── 상대 시간 ──────────────────────────────────────────────
function relativeTime(date: Date): string {
    const diff = Date.now() - date.getTime()
    const min = Math.floor(diff / 60000)
    const hr = Math.floor(diff / 3600000)
    const day = Math.floor(diff / 86400000)
    if (min < 1) return '방금 전'
    if (hr < 1) return `${min}분 전`
    if (day < 1) return `${hr}시간 전`
    if (day < 7) return `${day}일 전`
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── 댓글 등록 폼 ──────────────────────────────────────────
function CommentForm({ slug, onClose }: { slug: string; onClose: () => void }) {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (submitting) return
        if (!name.trim() || !password || !message.trim()) {
            setError('이름, 비밀번호, 내용을 모두 입력해주세요.')
            return
        }
        setError('')
        setSubmitting(true)
        try {
            const pwHash = await hashPassword(password)
            await addBlogComment(slug, { name: name.trim(), message: message.trim(), pwHash })
            onClose()
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
                setError('저장 권한이 없습니다. Firebase 보안 규칙을 확인해주세요.')
            } else {
                setError(`등록 실패: ${msg}`)
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="mt-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/3 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-white/90">댓글 작성</h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-white/60 transition-colors cursor-pointer"
                >
                    <IoClose className="w-4 h-4" />
                </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiUser className="w-4 h-4 text-zinc-400 dark:text-primary" />
                    </div>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-zinc-400/40 dark:focus:ring-primary/40 placeholder:text-zinc-400 dark:placeholder:text-white/30 transition-all"
                        placeholder="이름"
                        autoFocus
                    />
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <TbLockPassword className="w-4 h-4 text-zinc-400 dark:text-primary" />
                    </div>
                    <input
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-zinc-400/40 dark:focus:ring-primary/40 placeholder:text-zinc-400 dark:placeholder:text-white/30 transition-all"
                        placeholder="비밀번호 (수정·삭제 시 필요)"
                    />
                </div>
            </div>

            <div className="relative mb-3">
                <div className="absolute top-3 left-3 pointer-events-none">
                    <FiMessageSquare className="w-4 h-4 text-zinc-400 dark:text-primary" />
                </div>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-zinc-400/40 dark:focus:ring-primary/40 placeholder:text-zinc-400 dark:placeholder:text-white/30 resize-none transition-all"
                    placeholder="댓글을 남겨주세요..."
                />
            </div>

            {error && <p className="text-xs text-rose-500 mb-3" role="alert">{error}</p>}

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-white/50 dark:hover:text-white/70 rounded-xl bg-zinc-100 dark:bg-white/6 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                    취소
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-zinc-800 hover:bg-zinc-700 dark:bg-primary dark:hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                    {submitting ? '등록 중...' : '등록'}
                </button>
            </div>
        </div>
    )
}

// ── 수정 모달 ──────────────────────────────────────────────
function EditModal({
    slug, comment, onClose, onSuccess,
}: { slug: string; comment: BlogComment; onClose: () => void; onSuccess: () => void }) {
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState(comment.message)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (!password) { setError('비밀번호를 입력하세요'); return }
        setSaving(true)
        try {
            const pwHash = await hashPassword(password)
            if (pwHash !== comment.pwHash) { setError('비밀번호가 일치하지 않습니다'); return }
            await updateBlogComment(slug, comment.id, message)
            onSuccess()
        } catch {
            setError('수정에 실패했습니다.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
                <div className="w-full md:max-w-md animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
                    <div className="rounded-t-2xl md:rounded-2xl border border-white/10 bg-zinc-950/98 backdrop-blur-xl p-5 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white">댓글 수정</h3>
                            <button type="button" onClick={onClose} className="p-1 rounded-lg text-white/35 hover:text-white/70 cursor-pointer transition-colors">
                                <IoClose className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="relative mb-3">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <TbLockPassword className="w-4 h-4 text-primary" />
                            </div>
                            <input
                                type="password"
                                autoFocus
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError('') }}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-white/30 transition-all"
                                placeholder="비밀번호 확인"
                            />
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-white/30 resize-none transition-all"
                        />
                        {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
                        <div className="flex gap-2 mt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm text-white/60 hover:text-white/80 rounded-xl bg-white/6 hover:bg-white/10 cursor-pointer transition-all">취소</button>
                            <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition-all">
                                {saving ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// ── 삭제 모달 ──────────────────────────────────────────────
function DeleteModal({
    slug, comment, onClose, onSuccess,
}: { slug: string; comment: BlogComment; onClose: () => void; onSuccess: () => void }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        if (!password) { setError('비밀번호를 입력하세요'); return }
        setDeleting(true)
        try {
            const pwHash = await hashPassword(password)
            if (pwHash !== comment.pwHash) { setError('비밀번호가 일치하지 않습니다'); return }
            await deleteBlogComment(slug, comment.id)
            onSuccess()
        } catch {
            setError('삭제에 실패했습니다.')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
                <div className="w-full md:max-w-sm animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
                    <div className="rounded-t-2xl md:rounded-2xl border border-white/10 bg-zinc-950/98 backdrop-blur-xl p-6 shadow-2xl">
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
                            <MdDelete className="w-5 h-5 text-rose-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">댓글 삭제</h3>
                        <p className="text-xs text-white/45 mb-4">삭제된 댓글은 복구할 수 없어요.</p>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <TbLockPassword className="w-4 h-4 text-primary" />
                            </div>
                            <input
                                type="password"
                                autoFocus
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError('') }}
                                onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm outline-none focus:ring-2 focus:ring-rose-500/40 placeholder:text-white/30 transition-all"
                                placeholder="비밀번호"
                            />
                        </div>
                        {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
                        <div className="flex gap-2 mt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm text-white/60 rounded-xl bg-white/6 hover:bg-white/10 cursor-pointer transition-all">취소</button>
                            <button type="button" onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 cursor-pointer transition-all">
                                {deleting ? '삭제 중...' : '삭제'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// ── 메인 BlogComments ──────────────────────────────────────
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
            {/* 헤더 */}
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

            {/* 댓글 목록 */}
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

            {/* 댓글 작성 폼 */}
            {showForm && (
                <CommentForm slug={slug} onClose={() => setShowForm(false)} />
            )}

            {/* 수정 모달 */}
            {editTarget && (
                <EditModal
                    slug={slug}
                    comment={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSuccess={() => setEditTarget(null)}
                />
            )}

            {/* 삭제 모달 */}
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
