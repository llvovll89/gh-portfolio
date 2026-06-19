import { useEffect, useState } from 'react'
import { LuMessageSquare, LuPencil, LuPencilLine, LuTrash2, LuChevronDown } from 'react-icons/lu'
import { db } from '@/firebase/config'
import {
    collection, onSnapshot, query, orderBy, limit,
    getDocs, startAfter, type DocumentSnapshot,
} from 'firebase/firestore'
import GuestbookEditModal from './GuestbookEditModal'
import GuestbookDeleteModal from './GuestbookDeleteModal'
import { getAvatarGradient } from './GuestbookDetailPanel'
import type { GuestbookEntry } from './types'
import { logger } from '@/utils/logger'

const PAGE_SIZE = 15

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

const getFullDate = (date: Date): string =>
    date.toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

function parseEntry(docSnap: { id: string; data: () => Record<string, unknown> }): GuestbookEntry {
    const data = docSnap.data()
    return {
        id: docSnap.id,
        name: (data.name as string) || '익명',
        message: (data.message as string) || '',
        pwHash: (data.pwHash as string) || '',
        createdAt: data.createdAt as GuestbookEntry['createdAt'],
    }
}

// No.(hidden mobile) | 작성자 | 내용 | 날짜 | 화살표
const COLS = 'grid grid-cols-[5.5rem_1fr_4.5rem_1.5rem] sm:grid-cols-[3rem_9rem_1fr_5.5rem_1.5rem]'

const SkeletonBoard = () => (
    <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className={`${COLS} bg-[#0a0a0e] border-b border-white/10 px-4 py-2.5 gap-4`}>
            <div className="hidden sm:block h-3 bg-white/8 rounded w-6 self-center" />
            <div className="h-3 bg-white/8 rounded w-16 self-center" />
            <div className="h-3 bg-white/8 rounded self-center" />
            <div className="h-3 bg-white/8 rounded w-12 self-center justify-self-end" />
            <div />
        </div>
        {[...Array(6)].map((_, i) => (
            <div key={i} className={`${COLS} border-b border-white/5 last:border-0 px-4 py-3.5 gap-4 animate-pulse`}>
                <div className="hidden sm:block h-3 bg-white/6 rounded w-5 self-center" />
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/8 shrink-0" />
                    <div className="h-3 bg-white/8 rounded w-14" />
                </div>
                <div className="h-3 bg-white/6 rounded self-center" />
                <div className="h-3 bg-white/6 rounded w-10 self-center justify-self-end" />
                <div />
            </div>
        ))}
    </div>
)

const GuestbookList = ({
    handleToggleForm,
    onSuccess,
    onCountChange,
}: {
    handleToggleForm: () => void
    onSuccess?: (msg: string) => void
    onCountChange?: (count: number) => void
}) => {
    const [latestEntries, setLatestEntries] = useState<GuestbookEntry[]>([])
    const [olderEntries, setOlderEntries] = useState<GuestbookEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null)
    const [readError, setReadError] = useState('')
    const [loadMoreError, setLoadMoreError] = useState('')
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [editEntry, setEditEntry] = useState<GuestbookEntry | null>(null)
    const [deleteEntry, setDeleteEntry] = useState<GuestbookEntry | null>(null)

    useEffect(() => {
        const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE))
        const unsub = onSnapshot(q,
            (snapshot) => {
                setLatestEntries(snapshot.docs.map(parseEntry))
                setHasMore(snapshot.docs.length === PAGE_SIZE)
                setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null)
                setReadError('')
                setLoading(false)
            },
            (err) => {
                logger.error('방명록 불러오기 실패', err)
                const msg = err instanceof Error ? err.message : String(err)
                setReadError(msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')
                    ? 'Firebase 보안 규칙이 읽기를 차단하고 있습니다.'
                    : `불러오기 실패: ${msg}`)
                setLoading(false)
            },
        )
        return () => unsub()
    }, [])

    const loadMore = async () => {
        if (!lastDoc || loadingMore) return
        setLoadingMore(true)
        setLoadMoreError('')
        try {
            const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE))
            const snapshot = await getDocs(q)
            setOlderEntries((prev) => [...prev, ...snapshot.docs.map(parseEntry)])
            setHasMore(snapshot.docs.length === PAGE_SIZE)
            setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? lastDoc)
        } catch (err) {
            logger.error('방명록 추가 로드 실패', err)
            setLoadMoreError('추가 항목을 불러오지 못했습니다.')
        } finally {
            setLoadingMore(false)
        }
    }

    const allEntries = [...latestEntries, ...olderEntries]

    useEffect(() => {
        if (expandedId && !allEntries.find((e) => e.id === expandedId)) setExpandedId(null)
    }, [latestEntries, olderEntries])

    useEffect(() => {
        if (!loading) onCountChange?.(allEntries.length)
    }, [allEntries.length, loading])

    return (
        <div className="w-full h-full overflow-y-auto scrolls pb-2">

            {loading ? <SkeletonBoard /> : readError ? (
                <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
                    <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                        <LuMessageSquare className="w-8 h-8 text-rose-400/60" />
                    </div>
                    <p className="text-sm font-bold text-rose-400">불러오기 실패</p>
                    <p className="text-xs text-white/50 max-w-xs break-words">{readError}</p>
                </div>
            ) : allEntries.length === 0 ? (
                <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-5 p-12 text-center">
                    <div className="relative">
                        <div className="p-5 rounded-2xl bg-primary/8 border border-primary/18">
                            <LuMessageSquare className="w-9 h-9 text-primary/50" />
                        </div>
                        <div className="absolute inset-0 bg-primary/12 rounded-2xl blur-2xl -z-10 scale-110" />
                    </div>
                    <div>
                        <p className="text-base font-bold text-white/80 mb-1.5">아직 방명록이 없어요</p>
                        <p className="text-xs text-white/45">첫 번째 메시지를 남겨보세요!</p>
                    </div>
                    <button
                        onClick={handleToggleForm}
                        className="inline-flex items-center gap-2 cursor-pointer bg-linear-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-400 transition-all px-5 py-2.5 rounded-xl font-bold text-white text-sm shadow-lg shadow-primary/25 hover:scale-105 active:scale-95"
                    >
                        <LuPencilLine className="w-3.5 h-3.5" />
                        메시지 남기기
                    </button>
                </div>
            ) : (
                <>
                    <div className="rounded-xl border border-white/8 overflow-hidden">

                        {/* 헤더 */}
                        <div className={`${COLS} gap-4 bg-[#0a0a0e] border-b border-white/10 px-4 py-2.5`}>
                            <span className="hidden sm:block text-[11px] font-semibold text-white/45 text-center self-center">No.</span>
                            <span className="text-[11px] font-semibold text-white/45 self-center">작성자</span>
                            <span className="text-[11px] font-semibold text-white/45 self-center">내용</span>
                            <span className="text-[11px] font-semibold text-white/45 text-right self-center">날짜</span>
                            <span />
                        </div>

                        {/* 행 목록 */}
                        {allEntries.map((entry, idx) => {
                            const gradient = getAvatarGradient(entry.name)
                            const initial = entry.name[0]?.toUpperCase() || '?'
                            const dateStr = entry.createdAt?.toDate ? getRelativeTime(entry.createdAt.toDate()) : ''
                            const fullDateStr = entry.createdAt?.toDate ? getFullDate(entry.createdAt.toDate()) : ''
                            const num = allEntries.length - idx
                            const isOpen = expandedId === entry.id

                            return (
                                <div
                                    key={entry.id}
                                    className={[
                                        'border-b border-white/5 last:border-0 transition-colors duration-100',
                                        'animate-[fadeIn_0.3s_ease-out_both]',
                                        isOpen ? 'bg-primary/[0.05]' : 'hover:bg-white/[0.03]',
                                    ].join(' ')}
                                    style={{ animationDelay: `${idx * 0.025}s` }}
                                >
                                    {/* 행 헤더 — 클릭하면 토글 */}
                                    <div
                                        className="cursor-pointer"
                                        onClick={() => setExpandedId(isOpen ? null : entry.id)}
                                    >
                                        <div className={`${COLS} gap-4 px-4 py-3.5 items-center`}>
                                            {/* No. */}
                                            <span className="hidden sm:block text-xs text-white/50 text-center tabular-nums">{num}</span>

                                            {/* 작성자 */}
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`shrink-0 w-7 h-7 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center text-white font-bold text-[11px] shadow-sm`}>
                                                    {initial}
                                                </div>
                                                <span className="text-[13px] font-semibold text-white truncate">
                                                    {entry.name}
                                                </span>
                                            </div>

                                            {/* 내용 미리보기 */}
                                            <p className="text-[13px] text-white/75 truncate">
                                                {entry.message}
                                            </p>

                                            {/* 날짜 */}
                                            <span className="text-[11px] text-white/60 text-right tabular-nums shrink-0">
                                                {dateStr}
                                            </span>

                                            {/* 화살표 */}
                                            <LuChevronDown
                                                className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 justify-self-center ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                    </div>

                                    {/* 아코디언 본문 */}
                                    {isOpen && (
                                        <div className="px-5 py-4 border-t border-white/6 animate-in slide-in-from-top-1 fade-in duration-150">
                                            {/* 아바타 + 이름 + 날짜 */}
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className={`shrink-0 w-8 h-8 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                                                    {initial}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-semibold text-white">{entry.name}</p>
                                                    {fullDateStr && (
                                                        <p className="text-[11px] text-white/45 mt-0.5">{fullDateStr}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 메시지 본문 */}
                                            <p className="text-[13px] text-white/85 leading-7 whitespace-pre-wrap break-words pl-1">
                                                {entry.message}
                                            </p>

                                            {/* 수정/삭제 */}
                                            <div className="flex justify-end gap-1.5 mt-3 pt-3 border-t border-white/6">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setEditEntry(entry) }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/55 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer text-xs font-medium"
                                                >
                                                    <LuPencil className="w-3 h-3" />
                                                    수정
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setDeleteEntry(entry) }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/55 hover:text-rose-400 hover:bg-rose-400/10 transition-all cursor-pointer text-xs font-medium"
                                                >
                                                    <LuTrash2 className="w-3.5 h-3.5" />
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* 더 보기 */}
                    {hasMore && (
                        <div className="flex flex-col items-center gap-2 mt-4 pb-2">
                            {loadMoreError && <p className="text-xs text-rose-400/80">{loadMoreError}</p>}
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-6 py-2 text-xs font-medium text-white/60 hover:text-white/85 border border-white/10 hover:border-white/22 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white/3 hover:bg-white/5"
                            >
                                {loadingMore ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
                                        불러오는 중…
                                    </span>
                                ) : loadMoreError ? '다시 시도' : '더 보기'}
                            </button>
                        </div>
                    )}
                </>
            )}

            <GuestbookEditModal
                entry={editEntry}
                isOpen={editEntry !== null}
                onClose={() => setEditEntry(null)}
                onSuccess={onSuccess}
            />

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
