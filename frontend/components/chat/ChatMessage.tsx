"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Message } from "./types"

interface ChatMessageProps {
    message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    return (
        <div className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[75%]">

                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${message.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-background border border-border text-foreground"
                    }`}>
                    {message.role === "assistant" && message.content === "" ? (
                        <span className="flex gap-1 items-center h-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                        </span>
                    ) : message.role === "assistant" ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1 first:mt-0">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1 first:mt-0">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h3>,
                                ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>,
                                ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>,
                                li: ({ children }) => <li className="leading-snug">{children}</li>,
                                code: ({ children, className }) => {
                                    const isBlock = className?.includes("language-")
                                    return isBlock ? (
                                        <code className="block rounded-md bg-muted px-3 py-2 font-mono text-xs my-2 whitespace-pre-wrap overflow-x-auto">
                                            {children}
                                        </code>
                                    ) : (
                                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{children}</code>
                                    )
                                },
                                pre: ({ children }) => <>{children}</>,
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-2 border-border pl-3 text-muted-foreground my-2">{children}</blockquote>
                                ),
                                hr: () => <hr className="my-3 border-border" />,
                                a: ({ href, children }) => (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-75">{children}</a>
                                ),
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    ) : (
                        message.content
                    )}
                </div>

                {message.citations && message.citations.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                        {message.citations.map((c, i) => (
                            <span
                                key={i}
                                className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                                {c.source}
                            </span>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}
