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
    const [error, setError] = useState("")

    const handleSubmit = async () => {
        if (submitting) return
        if (!name.trim() || !password || !message.trim()) return
        setError("")
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
            console.error('방명록 등록 실패:', err)
            const msg = err instanceof Error ? err.message : String(err)
            // Firebase permission denied 메시지를 사용자 친화적으로 변환
            if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
                setError('저장 권한이 없습니다. Firebase 보안 규칙을 확인해주세요.')
            } else if (msg.includes('unavailable') || msg.includes('network')) {
                setError('네트워크 연결을 확인해주세요.')
            } else {
                setError(`등록에 실패했습니다: ${msg}`)
            }
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
            error={error}
            onChangeName={(v) => setName(v)}
            onChangeMessage={(v) => setMessage(v)}
            onChangePassword={(v) => { setPassword(v); setError("") }}
            onCancel={() => {
                setName("");
                setPassword("");
                setMessage("");
                setError("");
                if (handleToggleForm) handleToggleForm();
            }}
            onSubmit={handleSubmit}
            autoFocus={typeof autoFocus !== 'undefined' ? autoFocus : true}
            focusTarget={focusTarget}
        />
    )
}

export default GuestbookForm
