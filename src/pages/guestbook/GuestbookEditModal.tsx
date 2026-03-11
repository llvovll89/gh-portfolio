import { useState, useEffect } from 'react'
import { db } from '@/firebase/config'
import { doc, updateDoc } from 'firebase/firestore'
import { verifyPassword } from '@/utils/hashPassword'
import GuestbookEditor from './GuestbookEditor'
import type { GuestbookEntry } from './types'

type Props = {
    entry: GuestbookEntry | null
    isOpen: boolean
    onClose: () => void
    onSuccess?: (msg: string) => void
}

const GuestbookEditModal = ({ entry, isOpen, onClose, onSuccess }: Props) => {
    const [editPassword, setEditPassword] = useState('')
    const [editMessage, setEditMessage] = useState(entry?.message ?? '')
    const [editError, setEditError] = useState('')

    // entry가 바뀌면 메시지 초기화
    useEffect(() => {
        if (entry) setEditMessage(entry.message)
    }, [entry?.id])

    const handleClose = () => {
        setEditPassword('')
        setEditMessage(entry?.message ?? '')
        setEditError('')
        onClose()
    }

    const handleSubmit = async () => {
        if (!entry) return
        if (!editPassword) { setEditError('비밀번호를 입력하세요'); return }
        const isMatch = await verifyPassword(editPassword, entry.pwHash)
        if (!isMatch) { setEditError('비밀번호가 일치하지 않습니다'); return }
        await updateDoc(doc(db, 'guestbook', entry.id), { message: editMessage })
        handleClose()
        onSuccess?.('메시지가 수정되었습니다.')
    }

    if (!isOpen || !entry) return null

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={handleClose} />
            <div className="fixed left-0 right-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4">
                <div className="w-full md:max-w-md animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
                    <GuestbookEditor
                        mode="edit"
                        name={entry.name}
                        message={editMessage}
                        submitting={false}
                        onChangeName={() => {}}
                        onChangeMessage={(v) => setEditMessage(v)}
                        onChangePassword={(v) => { setEditPassword(v); setEditError('') }}
                        onCancel={handleClose}
                        onSubmit={handleSubmit}
                        autoFocus
                        focusTarget="password"
                        error={editError}
                    />
                </div>
            </div>
        </>
    )
}

export default GuestbookEditModal
