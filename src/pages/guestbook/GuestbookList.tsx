import { useEffect, useState } from 'react'
import { FiMessageSquare } from 'react-icons/fi'
import { db } from '@/firebase/config'
import {
    collection, onSnapshot, query, orderBy, limit,
    getDocs, startAfter, type DocumentSnapshot,
} from 'firebase/firestore'
import { FaEdit } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'
import { FaPencil } from 'react-icons/fa6'
import GuestbookEditModal from './GuestbookEditModal'
import GuestbookDeleteModal from './GuestbookDeleteModal'
import GuestbookDetailPanel, { getAvatarGradient } from './GuestbookDetailPanel'
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

const SkeletonCard = () => (
    <li className="p-4 rounded-2xl border border-white/6 bg-[#111115] animate-pulse">
        <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 shrink-0" />
            <div className="flex-1 space-y-2 pt-0.5">
                <div className="flex items-center gap-2">
                    <div className="h-3 bg-white/10 rounded-full w-16" />
                    <div className="h-2.5 bg-white/6 rounded-full w-10" />
                </div>
                <div className="h-2.5 bg-white/7 rounded-full w-full" />
                <div className="h-2.5 bg-white/5 rounded-full w-3/4" />
            </div>
        </div>
    </li>
)

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
    const [detailEntry, setDetailEntry] = useState<GuestbookEntry | null>(null)
    const [editEntry, setEditEntry] = useState<GuestbookEntry | null>(null)
    const [deleteEntry, setDeleteEntry] = useState<GuestbookEntry | null>(null)

    useEffect(() => {
        const q = query(
            collection(db, 'guestbook'),
            orderBy('createdAt', 'desc'),
            limit(PAGE_SIZE),
        )
        const unsub = onSnapshot(
            q,
            (snapshot) => {
                const list = snapshot.docs.map(parseEntry)
                setLatestEntries(list)
                setHasMore(snapshot.docs.length === PAGE_SIZE)
                setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null)
                setReadError('')
                setLoading(false)
            },
            (err) => {
                logger.error('방명록 불러오기 실패', err)
                const msg = err instanceof Error ? err.message : String(err)
                if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
                    setReadError('Firebase 보안 규칙이 읽기를 차단하고 있습니다.')
                } else {
                    setReadError(`불러오기 실패: ${msg}`)
                }
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
            const q = query(
                collection(db, 'guestbook'),
                orderBy('createdAt', 'desc'),
                startAfter(lastDoc),
                limit(PAGE_SIZE),
            )
            const snapshot = await getDocs(q)
            const list = snapshot.docs.map(parseEntry)
            setOlderEntries((prev) => [...prev, ...list])
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
        if (detailEntry && !allEntries.find((e) => e.id === detailEntry.id)) {
            setDetailEntry(null)
        }
    }, [latestEntries, olderEntries])

    useEffect(() => {
        if (!loading) onCountChange?.(allEntries.length)
    }, [allEntries.length, loading])

    return (
        <div className="w-full h-full flex gap-3">
            {/* 왼쪽: 목록 */}
            <div className="overflow-y-auto scrolls w-full md:w-[45%] shrink-0 pb-2">
                {loading ? (
                    <ul className="flex flex-col gap-2.5">
                        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                    </ul>
                ) : readError ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
                        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                            <FiMessageSquare className="w-8 h-8 text-rose-400/60" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-rose-400 mb-1">불러오기 실패</p>
                            <p className="text-xs text-white/40 max-w-xs break-words">{readError}</p>
                        </div>
                    </div>
                ) : allEntries.length === 0 ? (
                    <div role="status" aria-live="polite" className="h-full flex flex-col items-center justify-center gap-5 p-8 text-center">
                        <div className="relative">
                            <div className="p-5 rounded-2xl bg-white/4 border border-white/8">
                                <FiMessageSquare className="w-9 h-9 text-white/25" />
                            </div>
                            <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl -z-10" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-white/60 mb-1.5">아직 방명록이 없어요</p>
                            <p className="text-xs text-white/35">첫 번째 메시지를 남겨보세요!</p>
                        </div>
                        <button
                            onClick={handleToggleForm}
                            className="inline-flex items-center gap-2 cursor-pointer bg-linear-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 transition-all px-5 py-2.5 rounded-xl font-semibold text-white text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                        >
                            <FaPencil className="w-3.5 h-3.5" />
                            메시지 남기기
                        </button>
                    </div>
                ) : (
                    <>
                        <ul className="flex flex-col gap-2.5">
                            {allEntries.map((entry, idx) => {
                                const gradient = getAvatarGradient(entry.name)
                                const initial = entry.name[0]?.toUpperCase() || '?'
                                const dateStr = entry.createdAt?.toDate ? getRelativeTime(entry.createdAt.toDate()) : ''
                                const isLong = entry.message.length > 100 || entry.message.split('\n').length > 2
                                const isSelected = detailEntry?.id === entry.id

                                return (
                                    <li
                                        key={entry.id}
                                        onClick={() => setDetailEntry(isSelected ? null : entry)}
                                        className={[
                                            'group relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden',
                                            'animate-[fadeIn_0.35s_ease-out_both]',
                                            isSelected
                                                ? 'border-primary/40 bg-linear-to-br from-primary/[0.07] to-transparent shadow-[0_0_24px_rgba(0,153,255,0.12)]'
                                                : 'border-white/8 bg-[#111115] hover:border-white/14 hover:bg-[#161619] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40',
                                        ].join(' ')}
                                        style={{ animationDelay: `${idx * 0.04}s` }}
                                    >
                                        {/* Left accent bar */}
                                        <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-all duration-300 ${isSelected ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/25'}`} />

                                        {/* Decorative quote */}
                                        <div className="absolute right-3 top-1 text-6xl font-serif leading-none text-white/[0.035] pointer-events-none select-none">"</div>

                                        <div className="pl-3 pr-4 py-4 flex gap-3">
                                            {/* Avatar */}
                                            <div className="shrink-0 relative">
                                                <div className={`w-9 h-9 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                                    {initial}
                                                </div>
                                                {isSelected && (
                                                    <div className={`absolute inset-0 rounded-full bg-linear-to-br ${gradient} opacity-40 blur-md -z-10 scale-125`} />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                        <span className="font-semibold text-white/90 text-sm truncate">{entry.name}</span>
                                                        {dateStr && (
                                                            <span className="text-[10px] text-white/28 shrink-0">{dateStr}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setEditEntry(entry) }}
                                                            className="p-2 rounded-lg text-white/30 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                                                            aria-label={`${entry.name}의 메시지 수정`}
                                                            title="수정"
                                                        >
                                                            <FaEdit className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setDeleteEntry(entry) }}
                                                            className="p-2 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-400/10 transition-all cursor-pointer"
                                                            aria-label={`${entry.name}의 메시지 삭제`}
                                                            title="삭제"
                                                        >
                                                            <MdDelete className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-white/55 text-xs leading-relaxed line-clamp-3 whitespace-pre-wrap break-words">
                                                    {entry.message}
                                                </p>

                                                {isLong && (
                                                    <span className="text-[10px] text-primary/50 mt-1.5 inline-flex items-center gap-0.5 group-hover:text-primary/80 transition-colors">
                                                        더 보기 →
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>

                        {hasMore && (
                            <div className="flex flex-col items-center gap-2 mt-4 pb-2">
                                {loadMoreError && (
                                    <p className="text-xs text-rose-400/80">{loadMoreError}</p>
                                )}
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="px-6 py-2 text-xs font-medium text-white/50 hover:text-white/80 border border-white/8 hover:border-white/18 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white/3 hover:bg-white/5"
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
            </div>

            {/* 오른쪽: 상세 패널 */}
            <GuestbookDetailPanel
                entry={detailEntry}
                onClose={() => setDetailEntry(null)}
                onEdit={(entry) => setEditEntry(entry)}
                onDelete={(entry) => setDeleteEntry(entry)}
            />

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
