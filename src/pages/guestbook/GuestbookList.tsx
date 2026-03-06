import { useEffect, useState } from 'react'
import { FiMessageSquare } from 'react-icons/fi'
import { db } from '@/firebase/config'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { FaEdit } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'
import { FaPencil } from 'react-icons/fa6'
import GuestbookEditModal from './GuestbookEditModal'
import GuestbookDeleteModal from './GuestbookDeleteModal'
import GuestbookDetailPanel, { getAvatarGradient } from './GuestbookDetailPanel'
import type { GuestbookEntry } from './types'

const getRelativeTime = (date: Date): string => {
    const diff = Date.now() - date.getTime()
    const min = Math.floor(diff / 60000)
    const hr = Math.floor(diff / 3600000)
    const day = Math.floor(diff / 86400000)
    if (min < 1) return '방금 전'
    if (hr < 1) return `${min}분 전`
    if (day < 1) return `${hr}시간 전`
    if (day < 7) return `${day}일 전`
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}

const SkeletonCard = () => (
    <li className="p-5 bg-white/3 border border-white/6 rounded-2xl animate-pulse">
        <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
            <div className="flex-1 space-y-2 pt-0.5">
                <div className="flex items-center gap-3">
                    <div className="h-3.5 bg-white/10 rounded-full w-20" />
                    <div className="h-3 bg-white/7 rounded-full w-14" />
                </div>
                <div className="h-3 bg-white/7 rounded-full w-full mt-2" />
                <div className="h-3 bg-white/7 rounded-full w-4/5" />
                <div className="h-3 bg-white/5 rounded-full w-2/3" />
            </div>
        </div>
    </li>
)

const GuestbookList = ({ handleToggleForm, onSuccess }: { handleToggleForm: () => void; onSuccess?: (msg: string) => void }) => {
    const [entries, setEntries] = useState<GuestbookEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [readError, setReadError] = useState("")
    const [detailEntry, setDetailEntry] = useState<GuestbookEntry | null>(null)
    const [editEntry, setEditEntry] = useState<GuestbookEntry | null>(null)
    const [deleteEntry, setDeleteEntry] = useState<GuestbookEntry | null>(null)

    useEffect(() => {
        const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'))
        const unsub = onSnapshot(q, (snapshot) => {
            const list: GuestbookEntry[] = []
            snapshot.forEach((docSnap) => {
                const data = docSnap.data()
                list.push({
                    id: docSnap.id,
                    name: data.name || '익명',
                    message: data.message || '',
                    pwHash: data.pwHash || '',
                    createdAt: data.createdAt,
                })
            })
            setEntries(list)
            setReadError("")
            setLoading(false)
        }, (err) => {
            console.error('방명록 불러오기 실패:', err)
            const msg = err instanceof Error ? err.message : String(err)
            if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
                setReadError('Firebase 보안 규칙이 읽기를 차단하고 있습니다. Firebase Console → Firestore → Rules를 확인해주세요.')
            } else {
                setReadError(`불러오기 실패: ${msg}`)
            }
            setLoading(false)
        })
        return () => unsub()
    }, [])

    // 삭제 후 선택 항목 해제
    useEffect(() => {
        if (detailEntry && !entries.find(e => e.id === detailEntry.id)) {
            setDetailEntry(null)
        }
    }, [entries, detailEntry])

    return (
        <div className="w-full h-full flex gap-4">
            {/* 왼쪽: 목록 */}
            <div className="overflow-y-auto scrolls w-full md:w-1/2 md:max-w-[50%] shrink-0">
                {loading ? (
                    <ul className="grid grid-cols-1 gap-3">
                        <SkeletonCard /><SkeletonCard /><SkeletonCard />
                    </ul>
                ) : readError ? (
                    <div className="p-8 text-center w-full h-full flex flex-col items-center justify-center gap-4">
                        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                            <FiMessageSquare className="w-10 h-10 text-rose-400/60" />
                        </div>
                        <div>
                            <div className="text-base font-bold text-rose-400 mb-1.5">불러오기 실패</div>
                            <p className="text-xs text-white/50 max-w-xs break-words">{readError}</p>
                        </div>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="p-8 text-center w-full h-full flex flex-col items-center justify-center gap-5">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                            <FiMessageSquare className="w-10 h-10 text-white/30" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-white/70 mb-1.5">아직 방명록이 없어요</div>
                            <p className="text-sm text-white/40">첫 번째 메시지를 남겨보세요!</p>
                        </div>
                        <button
                            onClick={handleToggleForm}
                            className="inline-flex items-center gap-2 cursor-pointer bg-primary/80 hover:bg-primary transition-colors px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
                        >
                            <FaPencil className="w-3.5 h-3.5" />
                            방명록 남기기
                        </button>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-3">
                        {entries.map((entry) => {
                            const gradient = getAvatarGradient(entry.name)
                            const initial = entry.name[0]?.toUpperCase() || '?'
                            const dateStr = entry.createdAt?.toDate ? getRelativeTime(entry.createdAt.toDate()) : ''
                            const isLong = entry.message.length > 120 || entry.message.split('\n').length > 3
                            const isSelected = detailEntry?.id === entry.id

                            return (
                                <li
                                    key={entry.id}
                                    onClick={() => setDetailEntry(isSelected ? null : entry)}
                                    className={`group p-5 border rounded-2xl backdrop-blur-sm transition-all duration-200 cursor-pointer ${
                                        isSelected
                                            ? 'border-primary/40 bg-primary/[0.07]'
                                            : 'bg-white/3 hover:bg-white/[0.05] border-white/6 hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex gap-3.5">
                                        <div className={`shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base shadow-lg`}>
                                            {initial}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                                    <span className="font-semibold text-white/90 text-sm">{entry.name}</span>
                                                    {dateStr && (
                                                        <span className="text-[11px] text-white/35 shrink-0">{dateStr}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setEditEntry(entry) }}
                                                        className="p-1.5 rounded-lg text-white/40 hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-all cursor-pointer"
                                                        title="수정"
                                                    >
                                                        <FaEdit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setDeleteEntry(entry) }}
                                                        className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-400/10 active:bg-rose-400/20 transition-all cursor-pointer"
                                                        title="삭제"
                                                    >
                                                        <MdDelete className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-white/70 text-sm whitespace-pre-wrap break-words leading-relaxed line-clamp-3">
                                                {entry.message}
                                            </p>
                                            {isLong && (
                                                <span className="text-[11px] text-primary/70 mt-1.5 inline-block">
                                                    더 보기 →
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>

            {/* 오른쪽: 분할 상세 패널 + 모바일 모달 */}
            <GuestbookDetailPanel
                entry={detailEntry}
                onClose={() => setDetailEntry(null)}
                onEdit={(entry) => setEditEntry(entry)}
                onDelete={(entry) => setDeleteEntry(entry)}
            />

            {/* 수정 모달 */}
            <GuestbookEditModal
                entry={editEntry}
                isOpen={editEntry !== null}
                onClose={() => setEditEntry(null)}
                onSuccess={onSuccess}
            />

            {/* 삭제 모달 */}
            <GuestbookDeleteModal
                entry={deleteEntry}
                isOpen={deleteEntry !== null}
                onClose={() => setDeleteEntry(null)}
                onSuccess={onSuccess}
            />
        </div>
    )
}

export default GuestbookList
