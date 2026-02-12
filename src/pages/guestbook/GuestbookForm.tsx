import { useState } from "react"
import { db } from "@/firebase/config"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import hashPassword from "@/utils/hashPassword"
import GuestbookEditor from './GuestbookEditor'

type Props = {
    onSubmitted?: (msg?: string) => void
    autoFocus?: boolean
    focusTarget?: 'name' | 'password' | 'message'
    handleToggleForm?: () => void
}

const GuestbookForm = ({ onSubmitted, autoFocus, focusTarget, handleToggleForm }: Props) => {
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!name.trim() || !password || !message.trim()) return
        setSubmitting(true)
        try {
            const pwHash = await hashPassword(password)
            await addDoc(collection(db, 'guestbook'), {
                name: name.trim(),
                message: message.trim(),
                pwHash,
                createdAt: serverTimestamp(),
            })
            setName('')
            setPassword('')
            setMessage('')
            if (onSubmitted) onSubmitted('방명록이 등록되었습니다.')
        } catch (err) {
            console.error('방명록 등록 실패', err)
            alert('등록에 실패했습니다.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <GuestbookEditor
            mode="create"
            name={name}
            message={message}
            submitting={submitting}
            onChangeName={(v) => setName(v)}
            onChangeMessage={(v) => setMessage(v)}
            onChangePassword={(v) => setPassword(v)}
            onCancel={() => {
                setName("");
                setPassword("");
                setMessage("");
                if (handleToggleForm) handleToggleForm();
            }}
            onSubmit={handleSubmit}
            autoFocus={typeof autoFocus !== 'undefined' ? autoFocus : true}
            focusTarget={focusTarget}
        />
    )
}

export default GuestbookForm
