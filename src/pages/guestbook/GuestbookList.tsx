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
import { FaEdit, FaUser } from 'react-icons/fa'
import { FaDeleteLeft } from 'react-icons/fa6'
import { MdDescription } from 'react-icons/md'

type GuestbookEntry = {
    id: string
    name: string
    message: string
    pwHash: string
    createdAt?: any
}

const GuestbookList = ({ handleToggleForm, onSuccess }: { handleToggleForm: () => void; onSuccess?: (msg: string) => void }) => {
    const [entries, setEntries] = useState<GuestbookEntry[]>([])

    // edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<GuestbookEntry | null>(null)
    const [editPassword, setEditPassword] = useState('')
    const [editMessage, setEditMessage] = useState('')
    const [editError, setEditError] = useState('')

    

    useEffect(() => {
        const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'))
        const unsub = onSnapshot(q, (snapshot) => {
            const list: GuestbookEntry[] = []
            snapshot.forEach((docSnap) => {
                const data = docSnap.data() as any
                list.push({
                    id: docSnap.id,
                    name: data.name || '익명',
                    message: data.message || '',
                    pwHash: data.pwHash || '',
                    createdAt: data.createdAt,
                })
            })
            setEntries(list)
        })
        return () => unsub()
    }, [])

    const verifyAndUpdate = async (entry: GuestbookEntry) => {
        setEditingEntry(entry)
        setEditMessage(entry.message)
        setEditPassword('')
        setEditError('')
        setIsEditModalOpen(true)
    }

    const handleEditSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!editingEntry) return
        if (!editPassword) {
            setEditError('비밀번호를 입력하세요')
            return
        }
        const pwHash = await hashPassword(editPassword)
        if (pwHash !== editingEntry.pwHash) {
            setEditError('비밀번호가 일치하지 않습니다')
            return
        }
        await updateDoc(doc(db, 'guestbook', editingEntry.id), {
            message: editMessage,
        })
        setIsEditModalOpen(false)
        setEditingEntry(null)
        if (onSuccess) onSuccess('메시지가 수정되었습니다.')
    }

    const closeEditModal = () => {
        setIsEditModalOpen(false)
        setEditingEntry(null)
        setEditError('')
    }

    const verifyAndDelete = async (entry: GuestbookEntry) => {
        const pw = window.prompt('삭제하려면 비밀번호를 입력하세요')
        if (!pw) return
        const pwHash = await hashPassword(pw)
        if (pwHash !== entry.pwHash) {
            alert('비밀번호가 일치하지 않습니다.')
            return
        }
        const ok = window.confirm('정말 삭제하시겠습니까?')
        if (!ok) return
        await deleteDoc(doc(db, 'guestbook', entry.id))
        if (onSuccess) onSuccess('메시지가 삭제되었습니다.')
    }

    return (
        <div className="space-y-4 w-full h-full flex flex-col gap-1">
            {entries.length === 0 ? (
                <div className="sm:p-8 p-1 text-center bg-white/3 w-full h-full flex flex-col items-center justify-center gap-4">
                    <FiMessageSquare className="mx-auto w-16 h-16 text-white/30 mb-4" />
                    <div className="text-2xl font-bold text-white/85 mb-2">아직 등록된 방명록이 없습니다</div>
                    <p className="text-sm text-white/70 mb-4">첫 방문자의 메시지를 기다리고 있어요. 상단의 '방명록 등록' 버튼으로 남겨보세요.</p>
                    <div className="mx-auto w-full max-w-xs flex flex-col gap-3">
                        <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/8 text-sm text-white/60">등록하면 여기에서 바로 확인할 수 있습니다.</div>
                        <button onClick={handleToggleForm} className="cursor-pointer bg-primary/80 px-4 py-3 rounded-lg">
                            <span>등록하기</span>
                        </button>
                    </div>
                </div>
            ) : (
                <ul className="grid grid-cols-1 gap-4">
                    {entries.map((entry) => (
                        <li key={entry.id} className="p-4 bg-white/3 border border-white/6 rounded-xl backdrop-blur-sm">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-white/70 font-semibold flex items-center gap-2"><FaUser className="w-5 h-5" /> {entry.name}</div>
                                    <div className="mt-3 text-white/85 whitespace-pre-wrap break-all flex items-start gap-2">
                                        <MdDescription className="w-5 h-5 shrink-0" /> 
                                        <div className="break-all">{entry.message}</div>
                                    </div>
                                    <div className="mt-3 text-[11px] text-white/50">{entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleString() : ''}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        className="text-sm cursor-pointer text-primary flex items-center gap-2"
                                        onClick={() => verifyAndUpdate(entry)}
                                    >
                                        <FaEdit className="w-5 h-5" />
                                        수정
                                    </button>
                                    <button
                                        className="text-sm cursor-pointer text-rose-400 flex items-center gap-2"
                                        onClick={() => verifyAndDelete(entry)}
                                    >
                                        <FaDeleteLeft className="w-5 h-5" />
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {isEditModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-40" onClick={closeEditModal} />
                    <div className="fixed left-0 right-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center">
                        <div className="mx-auto w-full max-w-md p-4">
                            <div className="md:mx-0 md:my-0">
                                <div className="fixed left-0 right-0 bottom-0 z-50 md:relative">
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
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default GuestbookList
