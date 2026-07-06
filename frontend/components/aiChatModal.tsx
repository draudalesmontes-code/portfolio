"use client"
import { useState } from "react"
import { Bot } from "lucide-react"
import ChatWidget from "./chat/ChatWidget"

export default function AiChatModal() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* floating trigger button — bottom-right corner, always visible */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105"
            >
                <Bot className="h-5 w-5" />
            </button>

            {/* chat panel — only mounted when open */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 h-[500px] w-[380px] overflow-hidden rounded-xl border border-border bg-background shadow-xl">
                    <ChatWidget onClose={() => setIsOpen(false)} />
                </div>
            )}
        </>
    )
}
