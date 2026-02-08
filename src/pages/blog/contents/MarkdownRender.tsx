import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
                    h2: (props) => (
                        <h2
                            className={`mt-6 mb-3 text-2xl font-bold ${overflowXStyle} text-[clamp(1.25rem,2vw,2rem)]`}
                            {...props}
                        />
                    ),
                    h3: (props) => (
                        <h3
                            className={`mt-5 mb-2 text-xl font-semibold ${overflowXStyle} text-[clamp(1.1rem,1.5vw,1.5rem)]`}
                            {...props}
                        />
                    ),
                    p: (props) => (
                        <p
                            className="my-3 leading-7 text-zinc-800 text-[clamp(0.95rem,1.5vw,1.1rem)]"
                            {...props}
                        />
                    ),
                    a: (props) => (
                        <a
                            className="text-blue-600 dark:text-blue-400 underline underline-offset-4 text-[clamp(0.95rem,1.5vw,1.1rem)]"
                            target="_blank"
                            rel="noreferrer"
                            {...props}
                        />
                    ),
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
                    pre: (props) => (
                        <pre
                            className="my-4 overflow-x-auto max-w-full text-[]clamp(0.9rem,1.5vw,1rem)]"
                            {...props}
                        />
                    ),
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
