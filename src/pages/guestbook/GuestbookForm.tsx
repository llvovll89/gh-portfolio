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
    const [nameError, setNameError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [messageError, setMessageError] = useState("")

    const validate = () => {
        let valid = true
        if (!name.trim()) { setNameError("이름을 입력해주세요."); valid = false } else setNameError("")
        if (!password) { setPasswordError("비밀번호를 입력해주세요."); valid = false } else setPasswordError("")
        if (!message.trim()) { setMessageError("메시지를 입력해주세요."); valid = false } else setMessageError("")
        return valid
    }

    const handleSubmit = async () => {
        if (submitting) return
        if (!validate()) return
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
            nameError={nameError}
            passwordError={passwordError}
            messageError={messageError}
            onChangeName={(v) => { setName(v); if (nameError) setNameError("") }}
            onChangeMessage={(v) => { setMessage(v); if (messageError) setMessageError("") }}
            onChangePassword={(v) => { setPassword(v); setError(""); if (passwordError) setPasswordError("") }}
            onCancel={() => {
                setName(""); setPassword(""); setMessage("")
                setError(""); setNameError(""); setPasswordError(""); setMessageError("")
                if (handleToggleForm) handleToggleForm()
            }}
            onSubmit={handleSubmit}
            autoFocus={typeof autoFocus !== 'undefined' ? autoFocus : true}
            focusTarget={focusTarget}
        />
    )
}

export default GuestbookForm
