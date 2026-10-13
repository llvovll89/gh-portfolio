import { Modal } from "../../../components/modal/Modal";
import { uiText } from "../../../utils/uiText";
import { useState } from 'react'
import { LuKeyRound, LuX } from 'react-icons/lu'
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
        if (!password) { setError("비밀번호를 입력하세요"); return }
        setSaving(true)
        try {
            const isMatch = await verifyPassword(password, comment.pwHash)
            if (!isMatch) { setError("비밀번호가 일치하지 않습니다"); return }
            await updateBlogComment(slug, comment.id, message)
            onSuccess()
        } catch {
            setError("수정에 실패했습니다.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal isOpen onClose={onClose} ariaLabel={uiText("댓글 수정")}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-foreground">{uiText("댓글 수정")}</h3>
                            <button type="button" onClick={onClose} aria-label={uiText("닫기")} className="p-1 rounded-lg text-muted hover:text-muted cursor-pointer transition-colors">
                                <LuX className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="relative mb-3">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LuKeyRound className="w-4 h-4 text-primary" />
                            </div>
                            <input
                                type="password"
                                aria-label={uiText("비밀번호")}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError('') }}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted transition-all"
                                placeholder={uiText("비밀번호 확인")}
                            />
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            aria-label={uiText("댓글 내용")} maxLength={2000}
                            rows={4}
                            className="w-full px-3 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted resize-none transition-all"
                        />
                        {error && <p role="alert" className="text-xs text-rose-400 mt-2">{uiText(error)}</p>}
                        <div className="flex gap-2 mt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm text-muted hover:text-foreground rounded-xl bg-foreground/6 hover:bg-foreground/10 cursor-pointer transition-all">{uiText("취소")}</button>
                            <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm font-semibold text-foreground rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition-all">
                                {saving ? uiText("저장 중...") : uiText("저장")}
                            </button>
                        </div>

        </Modal>
    )
}
