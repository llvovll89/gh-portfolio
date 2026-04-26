import { useState } from 'react'
import { HiUser } from 'react-icons/hi'
import { FiMessageSquare } from 'react-icons/fi'
import { TbLockPassword } from 'react-icons/tb'
import { IoClose } from 'react-icons/io5'
import hashPassword from '@/utils/hashPassword'
import { addBlogComment } from '@/utils/blogComments'

export function CommentForm({ slug, onClose }: { slug: string; onClose: () => void }) {
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
