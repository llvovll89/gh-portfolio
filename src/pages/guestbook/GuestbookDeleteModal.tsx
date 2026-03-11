import { useState } from 'react'
import { db } from '@/firebase/config'
import { doc, deleteDoc } from 'firebase/firestore'
import { verifyPassword } from '@/utils/hashPassword'
import { MdDelete } from 'react-icons/md'
import { TbLockPassword } from 'react-icons/tb'
import type { GuestbookEntry } from './types'

type Props = {
    entry: GuestbookEntry | null
    isOpen: boolean
    onClose: () => void
    onSuccess?: (msg: string) => void
}

const GuestbookDeleteModal = ({ entry, isOpen, onClose, onSuccess }: Props) => {
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteError, setDeleteError] = useState('')
    const [deleting, setDeleting] = useState(false)

    const handleClose = () => {
        setDeletePassword('')
        setDeleteError('')
        onClose()
    }

    const handleSubmit = async () => {
        if (!entry) return
        if (!deletePassword) { setDeleteError('비밀번호를 입력하세요'); return }
        setDeleting(true)
        try {
            const isMatch = await verifyPassword(deletePassword, entry.pwHash)
            if (!isMatch) {
                setDeleteError('비밀번호가 일치하지 않습니다')
                return
            }
            await deleteDoc(doc(db, 'guestbook', entry.id))
            handleClose()
            onSuccess?.('메시지가 삭제되었습니다.')
        } catch {
            setDeleteError('삭제에 실패했습니다.')
        } finally {
            setDeleting(false)
        }
    }

    if (!isOpen || !entry) return null

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={handleClose} />
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
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
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
                                onClick={handleClose}
                                className="flex-1 px-4 py-2.5 bg-white/6 hover:bg-white/10 text-white/60 hover:text-white/80 rounded-xl transition-all cursor-pointer font-medium text-sm"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
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
    )
}

export default GuestbookDeleteModal
