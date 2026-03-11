import { FiMessageSquare } from 'react-icons/fi'
import { FaEdit } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'
import { IoClose } from 'react-icons/io5'
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
    return (
        <>
            {/* 데스크탑: 오른쪽 분할 패널 */}
            <div className={`hidden md:flex flex-1 flex-col rounded-2xl border transition-all duration-300 overflow-hidden ${
                entry ? 'border-white/10 bg-white/[0.03]' : 'border-white/6 border-dashed'
            }`}>
                {entry ? (
                    <>
                        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/6 shrink-0">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(entry.name)} flex items-center justify-center text-white font-bold text-base shadow-lg shrink-0`}>
                                {entry.name[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white/90 text-sm">{entry.name}</div>
                                {entry.createdAt?.toDate && (
                                    <div className="text-[11px] text-white/40 mt-0.5">
                                        {entry.createdAt.toDate().toLocaleString('ko-KR')}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onEdit(entry)}
                                    className="p-1.5 rounded-lg text-white/40 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                                    title="수정"
                                >
                                    <FaEdit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(entry)}
                                    className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-400/10 transition-all cursor-pointer"
                                    title="삭제"
                                >
                                    <MdDelete className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/8 transition-all cursor-pointer"
                                    title="닫기"
                                >
                                    <IoClose className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto scrolls px-5 py-4">
                            <p className="text-white/80 text-sm whitespace-pre-wrap break-words leading-relaxed">
                                {entry.message}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
                        <FiMessageSquare className="w-10 h-10 text-white/10" />
                        <p className="text-white/20 text-sm text-center">목록에서 항목을 선택하세요</p>
                    </div>
                )}
            </div>

            {/* 모바일: 하단 모달 */}
            {entry && (
                <>
                    <div className="md:hidden fixed inset-0 bg-black/55 z-[110] backdrop-blur-sm" onClick={onClose} />
                    <div className="md:hidden fixed inset-0 z-[120] flex items-end justify-center">
                        <div className="w-full animate-in slide-in-from-bottom duration-200">
                            <div className="rounded-t-2xl border border-white/10 bg-zinc-950/98 backdrop-blur-xl shadow-2xl max-h-[85dvh] flex flex-col">
                                <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/6 shrink-0">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(entry.name)} flex items-center justify-center text-white font-bold text-base shadow-lg shrink-0`}>
                                        {entry.name[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-white/90 text-sm">{entry.name}</div>
                                        {entry.createdAt?.toDate && (
                                            <div className="text-[11px] text-white/40 mt-0.5">
                                                {entry.createdAt.toDate().toLocaleString('ko-KR')}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/8 transition-all cursor-pointer shrink-0"
                                    >
                                        <IoClose className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="px-5 py-4 overflow-y-auto scrolls">
                                    <p className="text-white/80 text-sm whitespace-pre-wrap break-words leading-relaxed">
                                        {entry.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default GuestbookDetailPanel
