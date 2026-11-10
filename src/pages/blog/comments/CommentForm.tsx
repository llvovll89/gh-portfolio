import { uiText } from "../../../utils/uiText";
import { useState } from 'react'
import { LuUser, LuMessageSquare, LuKeyRound, LuX } from 'react-icons/lu'
import { addBlogComment } from '@/utils/blogComments'

export function CommentForm({ slug, onClose }: { slug: string; onClose: () => void }) {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [invalidFields, setInvalidFields] = useState<string[]>([])

    const handleSubmit = async () => {
        if (submitting) return
        if (!name.trim() || !password || !message.trim()) {
            const missing = [
                !name.trim() && 'comment-name',
                !password && 'comment-password',
                !message.trim() && 'comment-message',
            ].filter((field): field is string => !!field)
            setInvalidFields(missing)
            setError("이름, 비밀번호, 내용을 모두 입력해주세요.")
            document.getElementById(missing[0])?.focus()
            return
        }
        setInvalidFields([])
        setError('')
        setSubmitting(true)
        try {
            await addBlogComment(slug, { name: name.trim(), message: message.trim(), password })
            onClose()
        } catch {
            setError("댓글을 저장하지 못했어요. 잠시 후 다시 시도해주세요.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="mt-6 rounded-2xl border border-foreground/10 bg-foreground/5 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">{uiText("댓글 작성")}</h3>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={uiText("닫기")}
                    className="p-1 rounded-lg text-muted hover:text-muted transition-colors cursor-pointer"
                >
                    <LuX className="w-4 h-4" />
                </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div>
                    <label htmlFor="comment-name" className="mb-1 block text-xs font-medium text-muted">{uiText("이름")}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LuUser className="w-4 h-4 text-primary" />
                        </div>
                        <input
                            id="comment-name" maxLength={40}
                            value={name}
                            onChange={(e) => { setName(e.target.value); setInvalidFields((prev) => prev.filter((field) => field !== 'comment-name')) }}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-input-line bg-foreground/5 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted transition-all"
                            placeholder={uiText("이름")}
                            aria-invalid={invalidFields.includes('comment-name')}
                            aria-describedby={invalidFields.includes('comment-name') ? 'comment-form-error' : undefined}
                            // '댓글 작성' 트리거 버튼이 폼 표시와 함께 언마운트되므로 포커스 유실을 막기 위해 첫 필드로 이동
                            // eslint-disable-next-line jsx-a11y-x/no-autofocus
                            autoFocus
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="comment-password" className="mb-1 block text-xs font-medium text-muted">{uiText("비밀번호")}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LuKeyRound className="w-4 h-4 text-primary" />
                        </div>
                        <input
                            id="comment-password"
                            type="password"
                            autoComplete="new-password"
                            maxLength={100}
                            onChange={(e) => { setPassword(e.target.value); setInvalidFields((prev) => prev.filter((field) => field !== 'comment-password')) }}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-input-line bg-foreground/5 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted transition-all"
                            placeholder={uiText("비밀번호 (수정·삭제 시 필요)")}
                            aria-invalid={invalidFields.includes('comment-password')}
                            aria-describedby={invalidFields.includes('comment-password') ? 'comment-form-error' : undefined}
                        />
                    </div>
                </div>
            </div>

            <label htmlFor="comment-message" className="mb-1 block text-xs font-medium text-muted">{uiText("댓글 내용")}</label>
            <div className="relative mb-3">
                <div className="absolute top-3 left-3 pointer-events-none">
                    <LuMessageSquare className="w-4 h-4 text-primary" />
                </div>
                <textarea
                    id="comment-message" maxLength={2000}
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); setInvalidFields((prev) => prev.filter((field) => field !== 'comment-message')) }}
                    onKeyDown={(e) => { if (!e.nativeEvent.isComposing && (e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); void handleSubmit(); } }}
                    rows={3}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-input-line bg-foreground/5 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted resize-none transition-all"
                    placeholder={uiText("댓글을 남겨주세요… (Ctrl+Enter로 등록)")}
                    aria-invalid={invalidFields.includes('comment-message')}
                    aria-describedby={invalidFields.includes('comment-message') ? 'comment-form-error' : undefined}
                />
            </div>

            {error && <p id="comment-form-error" className="text-xs text-error mb-3" role="alert">{uiText(error)}</p>}

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-muted hover:text-muted rounded-xl bg-foreground/6 hover:bg-foreground/10 transition-all cursor-pointer"
                >
                    {uiText("취소")}</button>
                <button
                    type="button"
                    onClick={() => { void handleSubmit(); }}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-semibold text-on-accent rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                    {submitting ? uiText("등록 중...") : uiText("등록")}
                </button>
            </div>
        </div>
    )
}
