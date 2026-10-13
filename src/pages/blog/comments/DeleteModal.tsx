import { Modal } from "../../../components/modal/Modal";
import { uiText } from "../../../utils/uiText";
import { useState } from 'react'
import { LuKeyRound, LuTrash2 } from 'react-icons/lu'
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
        if (!password) { setError("비밀번호를 입력하세요"); return }
        setDeleting(true)
        try {
            const isMatch = await verifyPassword(password, comment.pwHash)
            if (!isMatch) { setError("비밀번호가 일치하지 않습니다"); return }
            await deleteBlogComment(slug, comment.id)
            onSuccess()
        } catch {
            setError("삭제에 실패했습니다.")
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Modal isOpen onClose={onClose} ariaLabel={uiText("댓글 삭제")}>
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
                            <LuTrash2 className="w-5 h-5 text-rose-400" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground mb-1">{uiText("댓글 삭제")}</h3>
                        <p className="text-xs text-muted mb-4">{uiText("삭제된 댓글은 복구할 수 없어요.")}</p>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LuKeyRound className="w-4 h-4 text-primary" />
                            </div>
                            <input
                                type="password"
                                aria-label={uiText("비밀번호")}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError('') }}
                                onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-foreground/10 bg-foreground/5 text-foreground text-sm outline-none focus:ring-2 focus:ring-rose-500/40 placeholder:text-muted transition-all"
                                placeholder={uiText("비밀번호")}
                            />
                        </div>
                        {error && <p role="alert" className="text-xs text-rose-400 mt-2">{uiText(error)}</p>}
                        <div className="flex gap-2 mt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm text-muted rounded-xl bg-foreground/6 hover:bg-foreground/10 cursor-pointer transition-all">{uiText("취소")}</button>
                            <button type="button" onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 text-sm font-semibold text-foreground rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 cursor-pointer transition-all">
                                {deleting ? uiText("삭제 중...") : uiText("삭제")}
                            </button>
                        </div>

        </Modal>
    )
}
