import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDarkPlus from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";
import tsxLang from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescriptLang from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import jsxLang from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import javascriptLang from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsonLang from "react-syntax-highlighter/dist/esm/languages/prism/json";
import bashLang from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import cssLang from "react-syntax-highlighter/dist/esm/languages/prism/css";
import markupLang from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import pythonLang from "react-syntax-highlighter/dist/esm/languages/prism/python";
import sqlLang from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import markdownLang from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import { slugifyHeading } from "../../../utils/parseToc";
import { scrollToHeading } from "../../../utils/scrollToHeading";
import { DETAIL_SCROLL_ID } from "./Detail";

SyntaxHighlighter.registerLanguage("tsx", tsxLang);
SyntaxHighlighter.registerLanguage("typescript", typescriptLang);
SyntaxHighlighter.registerLanguage("ts", typescriptLang);
SyntaxHighlighter.registerLanguage("jsx", jsxLang);
SyntaxHighlighter.registerLanguage("javascript", javascriptLang);
SyntaxHighlighter.registerLanguage("js", javascriptLang);
SyntaxHighlighter.registerLanguage("json", jsonLang);
SyntaxHighlighter.registerLanguage("bash", bashLang);
SyntaxHighlighter.registerLanguage("sh", bashLang);
SyntaxHighlighter.registerLanguage("shell", bashLang);
SyntaxHighlighter.registerLanguage("css", cssLang);
SyntaxHighlighter.registerLanguage("html", markupLang);
SyntaxHighlighter.registerLanguage("xml", markupLang);
SyntaxHighlighter.registerLanguage("python", pythonLang);
SyntaxHighlighter.registerLanguage("py", pythonLang);
SyntaxHighlighter.registerLanguage("sql", sqlLang);
SyntaxHighlighter.registerLanguage("markdown", markdownLang);
SyntaxHighlighter.registerLanguage("md", markdownLang);

function extractText(children: unknown): string {
    if (typeof children === "string") return children;
    if (typeof children === "number") return String(children);
    if (Array.isArray(children)) return children.map(extractText).join("");
    if (children && typeof children === "object" && "props" in children) {
        const el = children as { props: { children: unknown } };
        return extractText(el.props.children);
    }
    return "";
}

function CodeBlock({ language, codeString }: { language: string; codeString: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="relative group my-4 max-w-full overflow-hidden rounded-lg">
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                showLineNumbers={false}
                customStyle={{
                    margin: 0,
                    padding: "1rem",
                    maxWidth: "100%",
                    overflowX: "auto",
                    fontSize: "clamp(0.85rem, 1.5vw, 0.95rem)",
                    fontFamily:
                        "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                }}
            >
                {codeString}
            </SyntaxHighlighter>
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

export const MarkdownRenderer = memo(({ content }: Props) => {
    const overflowXStyle = `max-w-full overflow-x-auto whitespace-nowrap`;
    const idCounts = new Map<string, number>();

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
                        const text = extractText(props.children);
                        const baseId = slugifyHeading(text);
                        const count = (idCounts.get(baseId) ?? 0) + 1;
                        idCounts.set(baseId, count);
                        const id = count > 1 ? `${baseId}-${count}` : baseId;
                        return (
                            <h2
                                id={id || undefined}
                                className={`mt-6 mb-3 text-2xl font-bold ${overflowXStyle} text-[clamp(1.25rem,2vw,2rem)]`}
                                {...props}
                            />
                        );
                    },
                    h3: (props) => {
                        const text = extractText(props.children);
                        const baseId = slugifyHeading(text);
                        const count = (idCounts.get(baseId) ?? 0) + 1;
                        idCounts.set(baseId, count);
                        const id = count > 1 ? `${baseId}-${count}` : baseId;
                        return (
                            <h3
                                id={id || undefined}
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
                                    className="text-blue-600 underline underline-offset-4 text-[clamp(0.95rem,1.5vw,1.1rem)]"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const id = decodeURIComponent(href!.slice(1));
                                        scrollToHeading(id, DETAIL_SCROLL_ID);
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
                                className="text-blue-600 underline underline-offset-4 text-[clamp(0.95rem,1.5vw,1.1rem)]"
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
                            className="my-4 border-l-4 border-zinc-300 pl-4 text-zinc-700 text-[clamp(0.95rem,1.5vw,1.1rem)] italic"
                            {...props}
                        />
                    ),
                    pre: ({ children }) => <>{children}</>,
                    code: ({ className, children }) => {
                        const isBlock = Boolean(className); // ```ts 같은 경우 className에 language-xxx 들어옴
                        if (isBlock) {
                            const match = /language-(\w+)/.exec(className ?? "");
                            const language = match?.[1] ?? "text";
                            const codeString = extractText(children).replace(/\n$/, "");
                            return <CodeBlock language={language} codeString={codeString} />;
                        }

                        return (
                            <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-zinc-900 text-[clamp(0.9rem,1.5vw,1rem)]">
                                {children}
                            </code>
                        );
                    },
                    hr: (props) => (
                        <hr
                            className="my-6 border-zinc-200"
                            {...props}
                        />
                    ),
                    img: (props) => (
                        <img
                            loading="lazy"
                            className="max-w-full h-auto rounded-lg my-4"
                            {...props}
                        />
                    ),
                    table: (props) => (
                        <div className="my-4 max-w-full overflow-x-auto scrolls">
                            <table className="w-full border-collapse text-[clamp(0.85rem,1.5vw,1rem)]" {...props} />
                        </div>
                    ),
                    th: (props) => (
                        <th
                            className="border border-zinc-300 bg-zinc-100 text-zinc-900 px-3 py-2 text-left font-semibold whitespace-nowrap"
                            {...props}
                        />
                    ),
                    td: (props) => (
                        <td
                            className="border border-zinc-300 px-3 py-2 align-top text-zinc-800"
                            {...props}
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
});
