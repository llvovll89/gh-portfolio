import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugifyHeading } from "../../../utils/parseToc";
import { DETAIL_SCROLL_ID } from "./Detail";

function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
    const preRef = useRef<HTMLPreElement>(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = preRef.current?.textContent ?? "";
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="relative group my-4">
            <pre
                ref={preRef}
                className="overflow-x-auto max-w-full text-[clamp(0.9rem,1.5vw,1rem)]"
                {...props}
            >
                {children}
            </pre>
            <button
                type="button"
                onClick={handleCopy}
                className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-mono transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                style={{
                    background: copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.1)",
                    color: copied ? "#86efac" : "rgba(255,255,255,0.6)",
                    border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.15)"}`,
                }}
                aria-label="코드 복사"
            >
                {copied ? "복사됨!" : "복사"}
            </button>
        </div>
    );
}

type Props = {
    content: string;
};

export const MarkdownRenderer = ({ content }: Props) => {
    const overflowXStyle = `max-w-full overflow-x-auto whitespace-nowrap`;

    return (
        <article className="w-full h-full flex flex-col bg-[#F5F7F8] md:p-4 p-3 rounded-[5px]">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: (props) => (
                        <h1
                            className={`mt-6 mb-4 text-3xl font-bold ${overflowXStyle} text-[clamp(1.5rem,2.5vw,2.5rem)]`}
                            {...props}
                        />
                    ),
                    h2: (props) => {
                        const text = Array.isArray(props.children)
                            ? (props.children as unknown[]).map((c) => (typeof c === "string" ? c : "")).join("")
                            : typeof props.children === "string"
                            ? props.children
                            : "";
                        return (
                            <h2
                                id={slugifyHeading(text) || undefined}
                                className={`mt-6 mb-3 text-2xl font-bold ${overflowXStyle} text-[clamp(1.25rem,2vw,2rem)]`}
                                {...props}
                            />
                        );
                    },
                    h3: (props) => {
                        const text = Array.isArray(props.children)
                            ? (props.children as unknown[]).map((c) => (typeof c === "string" ? c : "")).join("")
                            : typeof props.children === "string"
                            ? props.children
                            : "";
                        return (
                            <h3
                                id={slugifyHeading(text) || undefined}
                                className={`mt-5 mb-2 text-xl font-semibold ${overflowXStyle} text-[clamp(1.1rem,1.5vw,1.5rem)]`}
                                {...props}
                            />
                        );
                    },
                    p: (props) => (
                        <p
                            className="my-3 leading-7 text-zinc-800 text-[clamp(0.95rem,1.5vw,1.1rem)]"
                            {...props}
                        />
                    ),
                    a: ({ href, children, ...props }) => {
                        const isAnchor = href?.startsWith("#");
                        if (isAnchor) {
                            return (
                                <a
                                    href={href}
                                    className="text-blue-600 dark:text-blue-400 underline underline-offset-4 text-[clamp(0.95rem,1.5vw,1.1rem)]"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const id = href!.slice(1);
                                        const el = document.getElementById(id);
                                        const container = document.getElementById(DETAIL_SCROLL_ID);
                                        if (!el || !container) return;
                                        const offset =
                                            el.getBoundingClientRect().top -
                                            container.getBoundingClientRect().top +
                                            container.scrollTop -
                                            80;
                                        container.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
                                    }}
                                    {...props}
                                >
                                    {children}
                                </a>
                            );
                        }
                        return (
                            <a
                                href={href}
                                className="text-blue-600 dark:text-blue-400 underline underline-offset-4 text-[clamp(0.95rem,1.5vw,1.1rem)]"
                                target="_blank"
                                rel="noreferrer"
                                {...props}
                            >
                                {children}
                            </a>
                        );
                    },
                    ul: (props) => (
                        <ul className="my-3 list-disc pl-6" {...props} />
                    ),
                    ol: (props) => (
                        <ol className="my-3 list-decimal pl-6" {...props} />
                    ),
                    li: (props) => <li className="my-1" {...props} />,
                    blockquote: (props) => (
                        <blockquote
                            className="my-4 border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 text-zinc-700 dark:text-zinc-300 text-[clamp(0.95rem,1.5vw,1.1rem)] italic"
                            {...props}
                        />
                    ),
                    pre: (props) => <CodeBlock {...props} />,
                    code: ({ className, children, ...props }) => {
                        const isBlock = Boolean(className); // ```ts 같은 경우 className에 language-xxx 들어옴
                        if (isBlock) {
                            return (
                                <code
                                    className={[
                                        "block rounded-lg border border-zinc-200/60 dark:border-zinc-800",
                                        "bg-black/75",
                                        "p-4 text-zinc-900 dark:text-zinc-100",
                                        "overflow-x-auto max-w-full text-[clamp(0.9rem,1.5vw,1rem)]",
                                    ].join(" ")}
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <code
                                className="rounded bg-zinc-200 px-1.5 py-0.5 text-[clamp(0.9rem,1.5vw,1rem)]"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    hr: (props) => (
                        <hr
                            className="my-6 border-zinc-200 dark:border-zinc-800 "
                            {...props}
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
};
