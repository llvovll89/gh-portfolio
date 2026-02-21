import React from 'react'
import { FiMessageSquare } from 'react-icons/fi'
import { TbLockPassword } from 'react-icons/tb'
import { HiUser } from 'react-icons/hi'
import { IoClose } from 'react-icons/io5'

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
    error?: string
}

const GuestbookEditor: React.FC<EditorProps> = ({
    mode,
    name = '',
    message = '',
    submitting = false,
    onChangeName,
    onChangeMessage,
    onChangePassword,
    onCancel,
    onSubmit,
    autoFocus = false,
    focusTarget = 'name',
    error,
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
        <div className="rounded-t-2xl md:rounded-2xl border border-white/10 bg-zinc-950/98 backdrop-blur-xl shadow-2xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/6">
                <div>
                    <h3 className="text-base font-bold text-white">
                        {mode === 'create' ? '메시지 남기기' : '메시지 수정'}
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5">
                        {mode === 'create'
                            ? '궁금한 점이나 의견을 자유롭게 적어주세요'
                            : '수정할 내용을 입력하세요'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-1.5 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/8 transition-all cursor-pointer"
                >
                    <IoClose className="w-5 h-5" />
                </button>
            </div>

            <div className="px-5 py-4 space-y-3">
                {/* Name & Password */}
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiUser className="w-4 h-4 text-primary" />
                        </div>
                        <input
                            ref={nameRef}
                            value={name}
                            readOnly={mode === 'edit'}
                            onChange={(e) => onChangeName && onChangeName(e.target.value)}
                            className={`pl-9 pr-3 py-2.5 rounded-xl border text-sm transition-all placeholder:text-white/30 w-full outline-none ${
                                mode === 'edit'
                                    ? 'border-white/5 bg-white/3 text-white/35 cursor-not-allowed'
                                    : 'border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-primary/40 focus:border-primary/30'
                            }`}
                            placeholder="이름"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <TbLockPassword className="w-4 h-4 text-primary" />
                        </div>
                        <input
                            ref={passwordRef}
                            onChange={(e) => onChangePassword && onChangePassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
                            className="pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-white/5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 text-sm transition-all placeholder:text-white/30 text-white w-full"
                            placeholder={mode === 'create' ? '비밀번호' : '비밀번호 확인'}
                            type="password"
                        />
                    </div>
                </div>

                {/* Message */}
                <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                        <FiMessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <textarea
                        ref={messageRef}
                        value={message}
                        onChange={(e) => onChangeMessage && onChangeMessage(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 text-sm transition-all placeholder:text-white/30 resize-none text-white"
                        rows={4}
                        placeholder="소중한 메시지를 남겨주세요..."
                    />
                </div>

                {error && (
                    <p className="text-xs text-rose-400" role="alert" aria-live="polite">{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-white/6 hover:bg-white/10 text-white/55 hover:text-white/75 rounded-xl transition-all cursor-pointer font-medium text-sm"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all cursor-pointer font-semibold text-sm disabled:opacity-50 shadow-lg shadow-primary/20"
                        disabled={submitting}
                    >
                        {submitting ? '처리 중...' : mode === 'create' ? '등록하기' : '저장하기'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GuestbookEditor
