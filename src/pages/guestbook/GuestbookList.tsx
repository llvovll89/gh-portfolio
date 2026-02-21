import React, { useEffect, useState } from 'react'
import { FiMessageSquare } from 'react-icons/fi'
import { db } from '@/firebase/config'
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    doc,
    updateDoc,
    deleteDoc,
} from 'firebase/firestore'
import GuestbookEditor from './GuestbookEditor'
import hashPassword from '@/utils/hashPassword'
import { FaEdit } from 'react-icons/fa'
import { MdDelete } from 'react-icons/md'
import { FaPencil } from 'react-icons/fa6'
import { TbLockPassword } from 'react-icons/tb'
import { IoClose } from 'react-icons/io5'

type GuestbookEntry = {
    id: string
    name: string
    message: string
    pwHash: string
    createdAt?: any
}

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

const getAvatarGradient = (name: string) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

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

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<GuestbookEntry | null>(null)
    const [editPassword, setEditPassword] = useState('')
    const [editMessage, setEditMessage] = useState('')
    const [editError, setEditError] = useState('')

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deletingEntry, setDeletingEntry] = useState<GuestbookEntry | null>(null)
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteError, setDeleteError] = useState('')
    const [deleting, setDeleting] = useState(false)

    // 상세보기 모달
    const [detailEntry, setDetailEntry] = useState<GuestbookEntry | null>(null)

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
            setLoading(false)
        }, (err) => {
            console.error('방명록 불러오기 실패:', err)
            setLoading(false)
        })
        return () => unsub()
    }, [])

    const verifyAndUpdate = (e: React.MouseEvent, entry: GuestbookEntry) => {
        e.stopPropagation()
        setEditingEntry(entry)
        setEditMessage(entry.message)
        setEditPassword('')
        setEditError('')
        setIsEditModalOpen(true)
    }

    const handleEditSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!editingEntry) return
        if (!editPassword) { setEditError('비밀번호를 입력하세요'); return }
        const pwHash = await hashPassword(editPassword)
        if (pwHash !== editingEntry.pwHash) { setEditError('비밀번호가 일치하지 않습니다'); return }
        await updateDoc(doc(db, 'guestbook', editingEntry.id), { message: editMessage })
        setIsEditModalOpen(false)
        setEditingEntry(null)
        if (onSuccess) onSuccess('메시지가 수정되었습니다.')
    }

    const openDeleteModal = (e: React.MouseEvent, entry: GuestbookEntry) => {
        e.stopPropagation()
        setDeletingEntry(entry)
        setDeletePassword('')
        setDeleteError('')
        setIsDeleteModalOpen(true)
    }

    const handleDeleteSubmit = async () => {
        if (!deletingEntry) return
        if (!deletePassword) { setDeleteError('비밀번호를 입력하세요'); return }
        setDeleting(true)
        try {
            const pwHash = await hashPassword(deletePassword)
            if (pwHash !== deletingEntry.pwHash) {
                setDeleteError('비밀번호가 일치하지 않습니다')
                return
            }
            await deleteDoc(doc(db, 'guestbook', deletingEntry.id))
            setIsDeleteModalOpen(false)
            setDeletingEntry(null)
            if (onSuccess) onSuccess('메시지가 삭제되었습니다.')
        } catch {
            setDeleteError('삭제에 실패했습니다.')
        } finally {
            setDeleting(false)
        }
    }

    const closeEditModal = () => { setIsEditModalOpen(false); setEditingEntry(null); setEditError('') }
    const closeDeleteModal = () => { setIsDeleteModalOpen(false); setDeletingEntry(null); setDeleteError('') }

    return (
        <div className="w-full h-full flex flex-col">
            {loading ? (
                <ul className="grid grid-cols-1 gap-3">
                    <SkeletonCard /><SkeletonCard /><SkeletonCard />
                </ul>
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

                        return (
                            <li
                                key={entry.id}
                                onClick={() => setDetailEntry(entry)}
                                className="group p-5 bg-white/3 hover:bg-white/[0.05] border border-white/6 hover:border-white/10 rounded-2xl backdrop-blur-sm transition-all duration-200 cursor-pointer"
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
                                            {/* 모바일: 항상 보임 / 데스크탑: hover 시 보임 */}
                                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={(e) => verifyAndUpdate(e, entry)}
                                                    className="p-1.5 rounded-lg text-white/40 hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-all cursor-pointer"
                                                    title="수정"
                                                >
                                                    <FaEdit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => openDeleteModal(e, entry)}
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

            {/* 상세보기 모달 */}
            {detailEntry && (
                <>
                    <div className="fixed inset-0 bg-black/55 z-40 backdrop-blur-sm" onClick={() => setDetailEntry(null)} />
                    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
                        <div className="w-full md:max-w-lg animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
                            <div className="rounded-t-2xl md:rounded-2xl border border-white/10 bg-zinc-950/98 backdrop-blur-xl shadow-2xl max-h-[85dvh] md:max-h-[70vh] flex flex-col">
                                {/* 헤더 */}
                                <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/6 shrink-0">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(detailEntry.name)} flex items-center justify-center text-white font-bold text-base shadow-lg shrink-0`}>
                                        {detailEntry.name[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-white/90 text-sm">{detailEntry.name}</div>
                                        {detailEntry.createdAt?.toDate && (
                                            <div className="text-[11px] text-white/40 mt-0.5">
                                                {detailEntry.createdAt.toDate().toLocaleString('ko-KR')}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setDetailEntry(null)}
                                        className="p-1.5 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/8 transition-all cursor-pointer shrink-0"
                                    >
                                        <IoClose className="w-5 h-5" />
                                    </button>
                                </div>
                                {/* 메시지 */}
                                <div className="px-5 py-4 overflow-y-auto scrolls">
                                    <p className="text-white/80 text-sm whitespace-pre-wrap break-words leading-relaxed">
                                        {detailEntry.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* 수정 모달 */}
            {isEditModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={closeEditModal} />
                    <div className="fixed left-0 right-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4">
                        <div className="w-full md:max-w-md animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
                            <GuestbookEditor
                                mode="edit"
                                name={editingEntry?.name || ''}
                                message={editMessage}
                                submitting={false}
                                onChangeName={() => {}}
                                onChangeMessage={(v) => setEditMessage(v)}
                                onChangePassword={(v) => { setEditPassword(v); setEditError('') }}
                                onCancel={closeEditModal}
                                onSubmit={() => handleEditSubmit()}
                                autoFocus={true}
                                focusTarget="password"
                                error={editError}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* 삭제 모달 */}
            {isDeleteModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={closeDeleteModal} />
                    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
                        <div className="w-full md:max-w-sm animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
                            <div className="rounded-t-2xl md:rounded-2xl border border-white/10 bg-zinc-950/98 backdrop-blur-xl p-6 shadow-2xl">
                                <div className="mb-5">
                                    <div className="w-11 h-11 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
                                        <MdDelete className="w-5 h-5 text-rose-400" />
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-1">메시지 삭제</h3>
                                    <p className="text-sm text-white/45">삭제하려면 비밀번호를 입력하세요. 삭제된 메시지는 복구할 수 없어요.</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <TbLockPassword className="w-4 h-4 text-primary" />
                                    </div>
                                    <input
                                        type="password"
                                        autoFocus
                                        value={deletePassword}
                                        onChange={(e) => { setDeletePassword(e.target.value); setDeleteError('') }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleDeleteSubmit()}
                                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-white/5 outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500/30 text-white text-sm placeholder:text-white/30 transition-all"
                                        placeholder="비밀번호"
                                    />
                                </div>
                                {deleteError && (
                                    <p className="text-xs text-rose-400 mt-2">{deleteError}</p>
                                )}
                                <div className="flex gap-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={closeDeleteModal}
                                        className="flex-1 px-4 py-2.5 bg-white/6 hover:bg-white/10 text-white/60 hover:text-white/80 rounded-xl transition-all cursor-pointer font-medium text-sm"
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeleteSubmit}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer font-semibold text-sm"
                                    >
                                        {deleting ? '삭제 중...' : '삭제하기'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default GuestbookList
