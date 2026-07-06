export interface Citation {
    chunk_text: string
    source: string
    distance: number
}

export interface Message {
    role: "user" | "assistant"
    content: string
    citations?: Citation[]
}
