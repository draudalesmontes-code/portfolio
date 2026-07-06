"use client"
import {Message} from "./types"


interface ChatMessageProps {
    message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    return (
        <div className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[75%]">

                {/* bubble — content lives inside here */}
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
                    ) : message.content}
                </div>

                {/* citation pills sit below the bubble, not inside it */}
                {message.citations && message.citations.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                        {message.citations.map((c,i) => (
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