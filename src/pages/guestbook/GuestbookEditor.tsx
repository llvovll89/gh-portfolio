import React from 'react'
import { FiMessageSquare } from 'react-icons/fi'
import { TbLockPassword } from 'react-icons/tb'
import { HiUser } from 'react-icons/hi'

type EditorProps = {
    mode: 'create' | 'edit'
    name?: string
    message?: string
    passwordPlaceholder?: string
    submitting?: boolean
    onChangeName?: (v: string) => void
    onChangeMessage?: (v: string) => void
    onChangePassword?: (v: string) => void
    onCancel?: () => void
    onSubmit?: () => void
    autoFocus?: boolean
    focusTarget?: 'name' | 'password' | 'message'
}

const GuestbookEditor: React.FC<EditorProps> = ({
    mode,
    name = '',
    message = '',
    passwordPlaceholder = '비밀번호',
    submitting = false,
    onChangeName,
    onChangeMessage,
    onChangePassword,
    onCancel,
    onSubmit,
    autoFocus = false,
    focusTarget = 'name',
}) => {
    const nameRef = React.useRef<HTMLInputElement | null>(null)
    const passwordRef = React.useRef<HTMLInputElement | null>(null)
    const messageRef = React.useRef<HTMLTextAreaElement | null>(null)

    React.useEffect(() => {
        if (!autoFocus) return
        const t = setTimeout(() => {
            if (focusTarget === 'name') nameRef.current?.focus()
            else if (focusTarget === 'password') passwordRef.current?.focus()
            else messageRef.current?.focus()
        }, 120)
        return () => clearTimeout(t)
    }, [autoFocus, focusTarget])
    return (
        <div className="rounded-t-2xl md:rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl p-4 md:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] w-full">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg md:text-xl font-bold text-white">{mode === 'create' ? '메시지 남기기' : '메시지 수정'}</h3>
                    <p className="text-sm text-white/70">{mode === 'create' ? '궁금한 점이나 의견을 자유롭게 적어주세요.' : '수정할 내용을 입력하고 저장하세요.'}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/70">
                        <HiUser className="w-5 h-5 text-primary" />
                    </div>
                    <input
                        ref={nameRef}
                        value={name}
                        onChange={(e) => onChangeName && onChangeName(e.target.value)}
                        className="pl-10 pr-3 rounded-xl border border-white/10 bg-linear-to-br from-black/30 to-black/10 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/50 w-full"
                        placeholder="이름"
                    />
                </div>

                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/70">
                        <TbLockPassword className="w-5 h-5 text-primary" />
                    </div>
                    <input
                        ref={passwordRef}
                        onChange={(e) => onChangePassword && onChangePassword(e.target.value)}
                        className="pl-10 pr-3 rounded-xl border border-white/10 bg-linear-to-br from-black/30 to-black/10 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/50 w-full"
                        placeholder={passwordPlaceholder}
                        type="password"
                    />
                </div>
            </div>

            <div className="mt-3">
                <div className="pointer-events-none text-white/70 flex items-center gap-2 mb-2">
                    <FiMessageSquare className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">메시지</span>
                </div>
                <textarea
                    ref={messageRef}
                    value={message}
                    onChange={(e) => onChangeMessage && onChangeMessage(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-linear-to-br from-black/30 to-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/50 resize-none"
                    rows={5}
                    placeholder="소중한 메시지를 남겨주세요..."
                />
            </div>

            <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/95 text-black rounded-lg min-w-25 flex items-center justify-center cursor-pointer">
                    취소
                </button>
                <button type="button" onClick={onSubmit} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg min-w-25 justify-center cursor-pointer shadow-md disabled:opacity-60" disabled={submitting}>
                    {submitting ? '처리중...' : mode === 'create' ? '등록하기' : '저장'}
                </button>
            </div>
        </div>
    )
}

export default GuestbookEditor
