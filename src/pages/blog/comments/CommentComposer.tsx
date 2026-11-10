import { uiText } from "../../../utils/uiText";
import { useId, useRef, useState } from "react";
import { addBlogComment, updateBlogComment, CommentRequestError, type BlogComment } from "@/utils/blogComments";
import { bareField, ghostButton, inlineField, primaryButton, widgetFrame } from "./commentFormStyles";

const MESSAGE_MAX = 2000;

type Props =
    | { mode: "create"; slug: string; comment?: never; onDone?: () => void; onCancel?: never }
    | { mode: "edit"; slug: string; comment: BlogComment; onDone: () => void; onCancel: () => void };

type Field = "name" | "password" | "message";

/** VS Code 코멘트 위젯 형태의 작성·수정 폼 (제목 줄 → 본문 → 하단 바) */
export function CommentComposer({ mode, slug, comment, onDone, onCancel }: Props) {
    const id = useId();
    const isEdit = mode === "edit";
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(isEdit ? comment.message : "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [invalid, setInvalid] = useState<Field[]>([]);
    const nameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const messageRef = useRef<HTMLTextAreaElement>(null);
    const focusField = (field: Field) => {
        const target = { name: nameRef, password: passwordRef, message: messageRef }[field];
        target.current?.focus();
    };
    const errorId = `${id}-error`;
    const fieldProps = (field: Field) => ({
        "aria-invalid": invalid.includes(field),
        "aria-describedby": invalid.includes(field) ? errorId : undefined,
    });
    const clearInvalid = (field: Field) => {
        setInvalid(prev => prev.filter(item => item !== field));
        setError("");
    };

    const submit = async () => {
        if (submitting) return;
        const missing: Field[] = [];
        if (!message.trim()) missing.push("message");
        if (!isEdit && !name.trim()) missing.push("name");
        if (!password) missing.push("password");
        if (missing.length > 0) {
            setInvalid(missing);
            setError(isEdit ? "비밀번호를 입력하세요" : "이름, 비밀번호, 내용을 모두 입력해주세요.");
            focusField(missing[0]);
            return;
        }

        setSubmitting(true);
        try {
            if (isEdit) await updateBlogComment(slug, comment.id, message.trim(), password);
            else await addBlogComment(slug, { name: name.trim(), message: message.trim(), password });
            setInvalid([]);
            setError("");
            if (!isEdit) {
                setMessage("");
                setPassword("");
            }
            onDone?.();
        } catch (err) {
            const code = err instanceof CommentRequestError ? err.code : "server-error";
            if (code === "wrong-password") {
                setInvalid(["password"]);
                setError("비밀번호가 일치하지 않습니다");
                focusField("password");
            } else if (code === "rate-limited") {
                setError("요청이 너무 많아요. 잠시 후 다시 시도해주세요.");
            } else {
                setError(isEdit ? "수정에 실패했습니다." : "댓글을 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <div className={widgetFrame(invalid.length > 0)}>
                <label htmlFor={`${id}-message`} className="block border-b border-line px-3 py-1.5 text-xs font-medium text-muted">
                    {isEdit ? uiText("댓글 수정") : uiText("새 댓글")}
                </label>
                <textarea
                    ref={messageRef}
                    id={`${id}-message`}
                    value={message}
                    maxLength={MESSAGE_MAX}
                    rows={3}
                    onChange={(e) => { setMessage(e.target.value); clearInvalid("message"); }}
                    onKeyDown={(e) => {
                        if (!e.nativeEvent.isComposing && (e.ctrlKey || e.metaKey) && e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            void submit();
                        }
                        if (isEdit && e.key === "Escape") onCancel();
                    }}
                    placeholder={isEdit ? undefined : uiText("글에 대한 의견이나 질문을 남겨주세요")}
                    className={`${bareField} block w-full resize-y min-h-20 px-3 py-2.5 text-sm leading-relaxed`}
                    {...fieldProps("message")}
                />

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line px-2 py-2">
                    {!isEdit && (
                        <div className="flex min-w-0 flex-1 basis-40 items-center gap-1.5 sm:max-w-60">
                            <label htmlFor={`${id}-name`} className="w-14 shrink-0 pl-1 text-xs text-muted sm:w-auto">{uiText("이름")}</label>
                            <input
                                ref={nameRef}
                                id={`${id}-name`}
                                value={name}
                                maxLength={40}
                                autoComplete="nickname"
                                onChange={(e) => { setName(e.target.value); clearInvalid("name"); }}
                                className={`${inlineField} flex-1`}
                                {...fieldProps("name")}
                            />
                        </div>
                    )}
                    <div className="flex min-w-0 flex-1 basis-40 items-center gap-1.5 sm:max-w-60">
                        <label htmlFor={`${id}-password`} className="w-14 shrink-0 pl-1 text-xs text-muted sm:w-auto">{uiText("비밀번호")}</label>
                        <input
                            ref={passwordRef}
                            id={`${id}-password`}
                            type="password"
                            value={password}
                            maxLength={100}
                            autoComplete={isEdit ? "current-password" : "new-password"}
                            onChange={(e) => { setPassword(e.target.value); clearInvalid("password"); }}
                            className={`${inlineField} flex-1`}
                            {...fieldProps("password")}
                        />
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <span className="hidden text-[11px] tabular-nums text-muted sm:inline" aria-hidden="true">
                            {message.length}/{MESSAGE_MAX}
                        </span>
                        <span className="hidden items-center gap-1 text-[11px] text-muted md:inline-flex" aria-hidden="true">
                            <kbd className="rounded border border-line bg-inset px-1 font-sans">Ctrl</kbd>
                            <kbd className="rounded border border-line bg-inset px-1 font-sans">Enter</kbd>
                        </span>
                        {isEdit && (
                            <button type="button" onClick={onCancel} className={ghostButton}>{uiText("취소")}</button>
                        )}
                        <button type="button" onClick={() => { void submit(); }} disabled={submitting} className={primaryButton}>
                            {isEdit
                                ? (submitting ? uiText("저장 중...") : uiText("저장"))
                                : (submitting ? uiText("등록 중...") : uiText("등록"))}
                        </button>
                    </div>
                </div>
            </div>

            <p id={errorId} role={error ? "alert" : undefined} className={`mt-1.5 text-xs ${error ? "text-error" : "text-muted"}`}>
                {error
                    ? uiText(error)
                    : isEdit
                        ? uiText("작성할 때 입력한 비밀번호가 필요해요.")
                        : uiText("비밀번호는 나중에 댓글을 수정하거나 삭제할 때 필요해요.")}
            </p>
        </div>
    );
}
