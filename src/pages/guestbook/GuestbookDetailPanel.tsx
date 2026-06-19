import { useEffect } from 'react'
import { LuPencil, LuTrash2, LuX } from 'react-icons/lu'
import type { GuestbookEntry } from './types'

const AVATAR_GRADIENTS = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-pink-500 to-rose-600',
    'from-green-500 to-emerald-600',
    'from-orange-500 to-amber-600',
    'from-cyan-500 to-teal-600',
    'from-red-500 to-orange-600',
    'from-sky-500 to-blue-600',
]

export function getAvatarGradient(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

type Props = {
    entry: GuestbookEntry | null
    onClose: () => void
    onEdit: (entry: GuestbookEntry) => void
    onDelete: (entry: GuestbookEntry) => void
}

const GuestbookDetailPanel = ({ entry, onClose, onEdit, onDelete }: Props) => {
    useEffect(() => {
        if (!entry) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [entry, onClose])

    if (!entry) return null

    const gradient = getAvatarGradient(entry.name)
    const dateStr = entry.createdAt?.toDate
        ? entry.createdAt.toDate().toLocaleString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
        : ''

    return (
        <>
            {/* 오버레이 */}
            <div
                className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
                onClick={onClose}
            />

            {/* 모달 */}
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#111115] shadow-2xl shadow-black/60 max-h-[80dvh] flex flex-col animate-in zoom-in-95 fade-in duration-150">

                    {/* 헤더 */}
                    <div className="flex items-center gap-3.5 px-5 py-4 border-b border-white/8 shrink-0">
                        <div className="relative shrink-0">
                            <div className={`w-11 h-11 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center text-white font-bold text-base shadow-lg`}>
                                {entry.name[0]?.toUpperCase() || '?'}
                            </div>
                            <div className={`absolute inset-0 rounded-full bg-linear-to-br ${gradient} opacity-35 blur-lg -z-10 scale-125`} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white/92 text-[15px] truncate">{entry.name}</p>
                            {dateStr && (
                                <p className="text-[11px] text-white/30 mt-0.5">{dateStr}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => onEdit(entry)}
                                className="p-2 rounded-lg text-white/30 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                                title="수정"
                            >
                                <LuPencil className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onDelete(entry)}
                                className="p-2 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-400/10 transition-all cursor-pointer"
                                title="삭제"
                            >
                                <LuTrash2 className="w-4.5 h-4.5" />
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 rounded-lg text-white/25 hover:text-white/65 hover:bg-white/8 transition-all cursor-pointer ml-0.5"
                                title="닫기"
                            >
                                <LuX className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* 본문 */}
                    <div className="flex-1 overflow-y-auto scrolls px-6 py-5">
                        <div className="text-5xl font-serif text-primary/14 leading-none mb-2 select-none">"</div>
                        <p className="text-white/72 text-[14px] leading-7 whitespace-pre-wrap break-words">
                            {entry.message}
                        </p>
                        <div className="text-5xl font-serif text-primary/14 leading-none text-right mt-2 select-none">"</div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default GuestbookDetailPanel
