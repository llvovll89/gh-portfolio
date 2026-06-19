import React from 'react'
import { LuMessageSquare, LuKeyRound, LuUser, LuX, LuLoader } from 'react-icons/lu'

const MAX_MSG = 300

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
    nameError?: string
    passwordError?: string
    messageError?: string
}

const inputBase = 'pl-9 pr-3 py-2.5 rounded-xl border text-sm transition-all placeholder:text-white/25 w-full outline-none'
const inputNormal = 'border-white/10 bg-white/4 text-white focus:ring-1 focus:ring-primary/50 focus:border-primary/40 hover:border-white/18'
const inputError = 'border-rose-400/50 bg-white/4 text-white focus:ring-1 focus:ring-rose-400/30 focus:border-rose-400/30'
const inputDisabled = 'border-white/5 bg-white/2 text-white/35 cursor-not-allowed'

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
    nameError,
    passwordError,
    messageError,
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

    const msgLen = message.length
    const msgColor = msgLen > MAX_MSG * 0.9 ? 'text-rose-400' : msgLen > MAX_MSG * 0.7 ? 'text-amber-400' : 'text-white/30'

    return (
        <div className="rounded-t-2xl md:rounded-2xl border border-white/10 bg-[#111115] backdrop-blur-xl shadow-2xl w-full overflow-hidden">
            {/* Ambient top glow */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-64 h-16 bg-primary/8 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/6">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/15 border border-primary/20">
                        <LuMessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white/90">
                            {mode === 'create' ? '메시지 남기기' : '메시지 수정'}
                        </h3>
                        <p className="text-[10px] text-white/35 mt-0.5">
                            {mode === 'create' ? '궁금한 점이나 소감을 자유롭게 적어주세요' : '수정할 내용을 입력하세요'}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white/65 hover:bg-white/8 transition-all cursor-pointer"
                >
                    <LuX className="w-5 h-5" />
                </button>
            </div>

            <div className="px-5 py-4 space-y-3">
                {/* Name & Password */}
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LuUser className="w-4 h-4 text-primary/70" />
                            </div>
                            <input
                                ref={nameRef}
                                value={name}
                                readOnly={mode === 'edit'}
                                onChange={(e) => onChangeName && onChangeName(e.target.value)}
                                className={`${inputBase} ${mode === 'edit' ? inputDisabled : nameError ? inputError : inputNormal}`}
                                placeholder="이름"
                            />
                        </div>
                        {nameError && <p className="text-[11px] text-rose-400 pl-1" role="alert">{nameError}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LuKeyRound className="w-4 h-4 text-primary/70" />
                            </div>
                            <input
                                ref={passwordRef}
                                onChange={(e) => onChangePassword && onChangePassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
                                className={`${inputBase} ${passwordError ? inputError : inputNormal}`}
                                placeholder={mode === 'create' ? '비밀번호 (수정·삭제 시 사용)' : '비밀번호 확인'}
                                type="password"
                            />
                        </div>
                        {passwordError && <p className="text-[11px] text-rose-400 pl-1" role="alert">{passwordError}</p>}
                    </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1">
                    <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                            <LuMessageSquare className="w-4 h-4 text-primary/70" />
                        </div>
                        <textarea
                            ref={messageRef}
                            value={message}
                            onChange={(e) => onChangeMessage && onChangeMessage(e.target.value)}
                            maxLength={MAX_MSG}
                            className={[
                                'w-full pl-9 pr-4 py-3 rounded-xl border outline-none text-sm transition-all placeholder:text-white/25 resize-none text-white',
                                messageError ? inputError : inputNormal,
                            ].join(' ')}
                            rows={4}
                            placeholder="소중한 메시지를 남겨주세요..."
                        />
                        <span
                            aria-live="polite"
                            aria-label={`${msgLen}자 입력됨, 최대 ${MAX_MSG}자`}
                            className={`absolute bottom-3 right-3 text-[10px] tabular-nums transition-colors ${msgColor}`}
                        >
                            {msgLen} / {MAX_MSG}
                        </span>
                    </div>
                    {messageError && <p className="text-[11px] text-rose-400 pl-1" role="alert">{messageError}</p>}
                </div>

                {error && (
                    <p className="text-[11px] text-rose-400 bg-rose-400/8 border border-rose-400/20 rounded-lg px-3 py-2" role="alert">
                        {error}
                    </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/8 text-white/50 hover:text-white/70 rounded-xl transition-all cursor-pointer font-medium text-sm border border-white/8 hover:border-white/14"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={submitting}
                        className="flex-1 px-4 py-2.5 bg-linear-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white rounded-xl transition-all cursor-pointer font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <LuLoader className="w-4 h-4 animate-spin" />
                                처리 중...
                            </span>
                        ) : (mode === 'create' ? '등록하기' : '저장하기')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GuestbookEditor
