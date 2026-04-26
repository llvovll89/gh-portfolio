import { useState } from 'react'
import { TbLockPassword } from 'react-icons/tb'
import { MdDelete } from 'react-icons/md'
import { verifyPassword } from '@/utils/hashPassword'
import { deleteBlogComment, type BlogComment } from '@/utils/blogComments'

type Props = {
    slug: string
    comment: BlogComment
    onClose: () => void
    onSuccess: () => void
}

export function DeleteModal({ slug, comment, onClose, onSuccess }: Props) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        if (!password) { setError('비밀번호를 입력하세요'); return }
        setDeleting(true)
        try {
            const isMatch = await verifyPassword(password, comment.pwHash)
            if (!isMatch) { setError('비밀번호가 일치하지 않습니다'); return }
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
