import { useState } from 'react'
import { TbLockPassword } from 'react-icons/tb'
import { IoClose } from 'react-icons/io5'
import { verifyPassword } from '@/utils/hashPassword'
import { updateBlogComment, type BlogComment } from '@/utils/blogComments'

type Props = {
    slug: string
    comment: BlogComment
    onClose: () => void
    onSuccess: () => void
}

export function EditModal({ slug, comment, onClose, onSuccess }: Props) {
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState(comment.message)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (!password) { setError('비밀번호를 입력하세요'); return }
        setSaving(true)
        try {
            const isMatch = await verifyPassword(password, comment.pwHash)
            if (!isMatch) { setError('비밀번호가 일치하지 않습니다'); return }
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
