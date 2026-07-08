"use client"
import { useState } from "react";
import { flushSync } from "react-dom";
import { Bot, Send, X, Settings } from "lucide-react";
import { Message } from "./types";
import ChatMessage from "./ChatMessage";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ChatWidgetProps {
    onClose: () => void
}

const PROVIDERS = [
    { value: "groq",   label: "Groq (default)",  model: "Llama 3.1 8B Instant" },
    { value: "openai", label: "OpenAI",           model: "GPT-4o Mini" },
    { value: "claude", label: "Claude",           model: "Claude Opus 4" },
]

const BYOK_ENABLED = process.env.NEXT_PUBLIC_AI_BYOK_ENABLED === "true";

export default function ChatWidget({ onClose }: ChatWidgetProps) {
    const [messages, setMessages]      = useState<Message[]>([])
    const [input, setInput]            = useState<string>("")
    const [isStreaming, setIsStreaming] = useState<boolean>(false)
    const [sessionId, setSessionId]    = useState<string | null>(null)
    const [showByok, setShowByok]      = useState<boolean>(false)
    const [provider, setProvider]      = useState<string>("groq")
    const [apiKey, setApiKey]          = useState<string>("")

    async function handleSubmit(e: { preventDefault(): void }) {
        e.preventDefault()
        const message = input.trim()
        if (!message || isStreaming) return

        // flushSync forces user message to paint before anything else
        flushSync(() => {
            setMessages(prev => [...prev, { role: "user", content: message }])
            setInput("")
        })

        setIsStreaming(true)
        setMessages(prev => [...prev, { role: "assistant", content: "" }])

        try {
            const trimmedApiKey = apiKey.trim();
            const shouldUseByok = BYOK_ENABLED && showByok && trimmedApiKey.length > 0;
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            if (shouldUseByok) {
                headers["X-Api-Key"] = trimmedApiKey;
            }

            const res = await fetch("/ai/chat", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    message,
                    session_id: sessionId ?? undefined,
                    provider: shouldUseByok ? provider : "groq",
                    api_key: shouldUseByok ? trimmedApiKey : undefined,
                }),
            })

            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: "Request failed" }))
                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = { ...updated[updated.length - 1], content: `Error: ${err.detail}` }
                    return updated
                })
                return
            }

            const newSessionId = res.headers.get("x-session-id")
            if (newSessionId) setSessionId(newSessionId)

            const reader = res.body!.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const token = decoder.decode(value)
                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: updated[updated.length - 1].content + token,
                    }
                    return updated
                })
            }
        } catch {
            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { ...updated[updated.length - 1], content: "Something went wrong. Please try again." }
                return updated
            })
        } finally {
            setIsStreaming(false)
        }
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-4 py-4">
                <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <div>
                        <p className="text-sm font-semibold">Ask About Diego</p>
                        <p className="text-xs text-muted-foreground">
                            {PROVIDERS.find(p => p.value === provider)?.model}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {BYOK_ENABLED && (
                        <button
                            onClick={() => setShowByok(p => !p)}
                            className={`transition-colors ${showByok ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            title="Use your own API key"
                        >
                            <Settings className="h-4 w-4" />
                        </button>
                    )}
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {BYOK_ENABLED && showByok && (
                <div className="border-b px-4 py-3 space-y-2 bg-muted/40">
                    <p className="text-xs text-muted-foreground">
                        Use your own provider key for this request
                    </p>
                    <select
                        value={provider}
                        onChange={e => setProvider(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                    >
                        {PROVIDERS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                    <Input
                        type="password"
                        placeholder="API key (optional)"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        className="text-sm"
                    />
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => <ChatMessage key={i} message={m} />)}
            </div>

            <div className="border-t p-3">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        name="message"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask something about Diego..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={isStreaming}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
