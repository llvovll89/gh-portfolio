import { uiText } from "../../../utils/uiText";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { deleteBlogComment, CommentRequestError, type BlogComment } from "@/utils/blogComments";
import { relativeTime } from "./blogCommentUtils";
import { CommentComposer } from "./CommentComposer";
import { bareField, dangerButton, ghostButton, widgetFrame } from "./commentFormStyles";

type Mode = "view" | "edit" | "delete";

/** 스레드의 댓글 하나 — 수정은 제자리 편집, 삭제는 인라인 확인 줄 */
export function CommentItem({ slug, comment }: { slug: string; comment: BlogComment }) {
    const { i18n } = useTranslation();
    const id = useId();
    const [mode, setMode] = useState<Mode>("view");
    const editButtonRef = useRef<HTMLButtonElement>(null);
    const createdAt = comment.createdAt?.toDate?.();
    const initial = comment.name.trim()[0]?.toUpperCase() ?? "?";

    const returnFocus = useRef(false);
    const backToView = () => {
        returnFocus.current = true;
        setMode("view");
    };
    // 편집·삭제를 닫으면 렌더 후 트리거 버튼으로 포커스 복귀
    useEffect(() => {
        if (mode === "view" && returnFocus.current) {
            returnFocus.current = false;
            editButtonRef.current?.focus();
        }
    }, [mode]);

    return (
        <li className="group relative flex gap-3 pb-6 last:pb-0">
            {/* 스레드 레일: 아바타 아래로 이어지는 세로선 (마지막 댓글 제외) */}
            <span aria-hidden="true" className="absolute left-3.5 top-9 bottom-0 w-px bg-line group-last:hidden" />
            <span
                aria-hidden="true"
                className="relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-inset text-xs font-semibold text-primary"
            >
                {initial}
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex min-h-7 flex-wrap items-center gap-x-2">
                    <span className="text-sm font-semibold text-foreground">{comment.name}</span>
                    {createdAt && (
                        <time dateTime={createdAt.toISOString()} className="text-xs text-muted">
                            {relativeTime(createdAt, i18n.language)}
                        </time>
                    )}
                    {mode === "view" && (
                        <div className="ml-auto flex items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                            <button ref={editButtonRef} type="button" onClick={() => setMode("edit")} className={`${ghostButton} min-h-7 px-2 text-xs`}>
                                {uiText("수정")}
                            </button>
                            <button type="button" onClick={() => setMode("delete")} className={`${ghostButton} min-h-7 px-2 text-xs hover:text-error`}>
                                {uiText("삭제")}
                            </button>
                        </div>
                    )}
                </div>

                {mode === "edit" ? (
                    <div className="mt-2">
                        <CommentComposer mode="edit" slug={slug} comment={comment} onDone={backToView} onCancel={backToView} />
                    </div>
                ) : (
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">{comment.message}</p>
                )}

                {mode === "delete" && <DeleteConfirm id={id} slug={slug} comment={comment} onCancel={backToView} />}
            </div>
        </li>
    );
}

function DeleteConfirm({ id, slug, comment, onCancel }: { id: string; slug: string; comment: BlogComment; onCancel: () => void }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const errorId = `${id}-delete-error`;

    const confirm = async () => {
        if (!password) {
            setError("비밀번호를 입력하세요");
            inputRef.current?.focus();
            return;
        }
        setDeleting(true);
        try {
            // 성공 시 실시간 구독이 목록에서 제거하므로 별도 상태 갱신 불필요
            await deleteBlogComment(slug, comment.id, password);
        } catch (err) {
            const wrong = err instanceof CommentRequestError && err.code === "wrong-password";
            setError(wrong ? "비밀번호가 일치하지 않습니다" : "삭제에 실패했습니다.");
            inputRef.current?.focus();
            setDeleting(false);
        }
    };

    return (
        <div className="mt-2">
            <div className={`${widgetFrame(!!error)} flex flex-wrap items-center gap-2 px-2 py-2`}>
                <label htmlFor={`${id}-delete-password`} className="shrink-0 pl-1 text-xs text-muted">{uiText("비밀번호")}</label>
                <input
                    ref={inputRef}
                    id={`${id}-delete-password`}
                    type="password"
                    value={password}
                    maxLength={100}
                    autoComplete="current-password"
                    aria-invalid={!!error}
                    aria-describedby={errorId}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") void confirm();
                        if (e.key === "Escape") onCancel();
                    }}
                    className={`${bareField} min-w-0 flex-1 basis-32 px-1 py-1 text-sm`}
                    // 삭제 버튼을 누른 직후 바로 비밀번호를 입력하도록 이동 (트리거 버튼은 사라짐)
                    // eslint-disable-next-line jsx-a11y-x/no-autofocus
                    autoFocus
                />
                <div className="ml-auto flex items-center gap-2">
                    <button type="button" onClick={onCancel} className={ghostButton}>{uiText("취소")}</button>
                    <button type="button" onClick={() => { void confirm(); }} disabled={deleting} className={dangerButton}>
                        {deleting ? uiText("삭제 중...") : uiText("삭제")}
                    </button>
                </div>
            </div>
            <p id={errorId} role={error ? "alert" : undefined} className={`mt-1.5 text-xs ${error ? "text-error" : "text-muted"}`}>
                {error ? uiText(error) : uiText("작성할 때 입력한 비밀번호를 입력하면 삭제돼요. 삭제한 댓글은 되돌릴 수 없어요.")}
            </p>
        </div>
    );
}
