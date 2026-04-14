'use client'

import * as React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
    MessageCircle,
    X,
    Maximize2,
    Minimize2,
    Send,
    Bot,
    User,
    Sparkles,
    Loader2,
    Lightbulb,
    BookOpen,
    Trash2,
    Volume2,
    StopCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { askAiAssistant, type AiAssistantResponse } from '@/services/ai-service'
import { useVoiceSettings } from '@/hooks/use-voice-settings'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    suggestions?: string[]
    relatedTopics?: string[]
    timestamp: Date
}

const WELCOME_MESSAGE: Message = {
    id: 'welcome',
    role: 'assistant',
    content: `# 👋 Hi! I'm **Tensey**

Your English grammar assistant!

### How can I help?

- 📚 **Explain tenses**
- ✍️ **Check sentences**
- 🎯 **Practice tips**
- 💡 **Answer questions**

*Ask me anything!* 🚀`,
    suggestions: [
        'What are the 12 tenses?',
        'Explain Present Perfect',
        'Past Continuous usage',
    ],
    timestamp: new Date(),
}

// Simple markdown renderer for chat messages
function renderMarkdown(content: string): React.ReactNode {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let listItems: string[] = []
    let inCodeBlock = false
    let codeContent = ''
    let codeLanguage = ''

    const processInlineElements = (text: string): React.ReactNode => {
        // Process bold, italic, code, and links
        const parts: React.ReactNode[] = []
        let remaining = text
        let key = 0

        while (remaining) {
            // Bold **text**
            const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
            // Italic *text*
            const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/)
            // Inline code `code`
            const codeMatch = remaining.match(/`([^`]+)`/)
            // Links [text](url)
            const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/)

            const matches = [
                { type: 'bold', match: boldMatch, index: boldMatch?.index ?? Infinity },
                { type: 'italic', match: italicMatch, index: italicMatch?.index ?? Infinity },
                { type: 'code', match: codeMatch, index: codeMatch?.index ?? Infinity },
                { type: 'link', match: linkMatch, index: linkMatch?.index ?? Infinity },
            ].filter(m => m.match).sort((a, b) => a.index - b.index)

            if (matches.length === 0) {
                parts.push(remaining)
                break
            }

            const first = matches[0]
            if (first.index > 0) {
                parts.push(remaining.slice(0, first.index))
            }

            if (first.type === 'bold' && first.match) {
                parts.push(<strong key={key++} className="font-semibold">{first.match[1]}</strong>)
                remaining = remaining.slice(first.index + first.match[0].length)
            } else if (first.type === 'italic' && first.match) {
                parts.push(<em key={key++} className="italic">{first.match[1]}</em>)
                remaining = remaining.slice(first.index + first.match[0].length)
            } else if (first.type === 'code' && first.match) {
                parts.push(
                    <code key={key++} className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-primary">
                        {first.match[1]}
                    </code>
                )
                remaining = remaining.slice(first.index + first.match[0].length)
            } else if (first.type === 'link' && first.match) {
                parts.push(
                    <a
                        key={key++}
                        href={first.match[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 hover:text-primary/80"
                    >
                        {first.match[1]}
                    </a>
                )
                remaining = remaining.slice(first.index + first.match[0].length)
            }
        }

        return parts.length === 1 ? parts[0] : <>{parts}</>
    }

    const flushListItems = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={elements.length} className="list-disc list-inside space-y-0.5 my-1 ml-1">
                    {listItems.map((item, i) => (
                        <li key={i} className="text-xs">{processInlineElements(item)}</li>
                    ))}
                </ul>
            )
            listItems = []
        }
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Code blocks
        if (line.startsWith('```')) {
            if (!inCodeBlock) {
                flushListItems()
                inCodeBlock = true
                codeLanguage = line.slice(3).trim()
                codeContent = ''
            } else {
                elements.push(
                    <pre key={elements.length} className="bg-muted rounded-lg p-3 my-2 overflow-x-auto">
                        <code className="text-sm font-mono">{codeContent.trim()}</code>
                    </pre>
                )
                inCodeBlock = false
                codeContent = ''
                codeLanguage = ''
            }
            continue
        }

        if (inCodeBlock) {
            codeContent += line + '\n'
            continue
        }

        // Headers
        if (line.startsWith('### ')) {
            flushListItems()
            elements.push(
                <h3 key={elements.length} className="text-sm font-semibold mt-2 mb-0.5">
                    {processInlineElements(line.slice(4))}
                </h3>
            )
            continue
        }
        if (line.startsWith('## ')) {
            flushListItems()
            elements.push(
                <h2 key={elements.length} className="text-sm font-bold mt-2 mb-0.5">
                    {processInlineElements(line.slice(3))}
                </h2>
            )
            continue
        }
        if (line.startsWith('# ')) {
            flushListItems()
            elements.push(
                <h1 key={elements.length} className="text-base font-bold mt-1 mb-1">
                    {processInlineElements(line.slice(2))}
                </h1>
            )
            continue
        }

        // List items
        if (line.match(/^[-*] /)) {
            listItems.push(line.slice(2))
            continue
        }

        // Numbered list
        if (line.match(/^\d+\. /)) {
            const content = line.replace(/^\d+\. /, '')
            listItems.push(content)
            continue
        }

        // Empty line
        if (line.trim() === '') {
            flushListItems()
            elements.push(<div key={elements.length} className="h-2" />)
            continue
        }

        // Regular paragraph
        flushListItems()
        elements.push(
            <p key={elements.length} className="text-xs leading-relaxed">
                {processInlineElements(line)}
            </p>
        )
    }

    flushListItems()

    return <div className="space-y-0.5">{elements}</div>
}

export function TenseyChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const { speak, stop, isPlaying } = useVoiceSettings()
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null)

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        } else if (!isOpen) {
            stop()
        }
    }, [isOpen, stop])

    const handleSend = async (messageText?: string) => {
        const text = messageText || input.trim()
        if (!text || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response: AiAssistantResponse = await askAiAssistant(text)

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.reply,
                suggestions: response.suggestions,
                relatedTopics: response.relatedTopics,
                timestamp: new Date(),
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I encountered an error. Please try again! 🙏",
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const clearChat = () => {
        setMessages([WELCOME_MESSAGE])
    }

    const handleSuggestionClick = (suggestion: string) => {
        handleSend(suggestion)
    }

    const handleReadAloud = (messageId: string, text: string) => {
        if (isPlaying && playingMessageId === messageId) {
            stop()
            setPlayingMessageId(null)
        } else {
            // Stop any current speech first if playing another message
            if (isPlaying) stop()

            setPlayingMessageId(messageId)
            speak(text)
        }
    }

    // Sync local playing state with global audio state
    useEffect(() => {
        if (!isPlaying) {
            setPlayingMessageId(null)
        }
    }, [isPlaying])

    return (
        <LayoutGroup>
            {/* Floating Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-linear-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                        aria-label="Open Tensey Chat"
                    >
                        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 items-center justify-center">
                                <Sparkles className="w-2.5 h-2.5 text-white" />
                            </span>
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: { type: 'spring', damping: 25, stiffness: 300 }
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        layout
                        layoutId="tensey-chat-window"
                        className={cn(
                            'fixed z-50 flex flex-col bg-background border border-border rounded-2xl shadow-2xl',
                            isExpanded
                                ? 'inset-2 md:inset-6'
                                : 'bottom-4 right-4 left-4 md:left-auto md:w-80 h-[420px] md:h-[480px]'
                        )}
                    >
                        {/* Header */}
                        <motion.div
                            layout="position"
                            className="shrink-0 flex items-center justify-between px-3 py-2 bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-b border-border rounded-t-2xl"
                        >
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1">
                                        Tensey
                                        <Sparkles className="w-3 h-3 text-yellow-500" />
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground">Grammar Assistant</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={clearChat}
                                    className="text-muted-foreground hover:text-foreground"
                                    title="Clear chat"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-muted-foreground hover:text-foreground"
                                    title={isExpanded ? 'Minimize' : 'Expand'}
                                >
                                    {isExpanded ? (
                                        <Minimize2 className="w-4 h-4" />
                                    ) : (
                                        <Maximize2 className="w-4 h-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => {
                                        setIsOpen(false)
                                        setIsExpanded(false)
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                    title="Close"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>

                        {/* Messages */}
                        <motion.div
                            layout
                            className="flex-1 overflow-hidden"
                        >
                            <ScrollArea className="h-full">
                                <div className="p-3 space-y-3">
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                'flex gap-3',
                                                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                            )}
                                        >
                                            {/* Avatar */}
                                            <div
                                                className={cn(
                                                    'shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
                                                    message.role === 'user'
                                                        ? 'bg-secondary'
                                                        : 'bg-linear-to-br from-primary to-primary/60'
                                                )}
                                            >
                                                {message.role === 'user' ? (
                                                    <User className="w-3 h-3 text-secondary-foreground" />
                                                ) : (
                                                    <Bot className="w-3 h-3 text-primary-foreground" />
                                                )}
                                            </div>

                                            {/* Message Content */}
                                            <div
                                                className={cn(
                                                    'flex flex-col max-w-[85%]',
                                                    message.role === 'user' ? 'items-end' : 'items-start'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'rounded-xl px-3 py-2',
                                                        message.role === 'user'
                                                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                            : 'bg-muted/50 text-foreground rounded-bl-sm border border-border/50'
                                                    )}
                                                >
                                                    {message.role === 'user' ? (
                                                        <p className="text-xs">{message.content}</p>
                                                    ) : (
                                                        renderMarkdown(message.content)
                                                    )}
                                                </div>

                                                {/* Read Aloud Button - Only for assistant messages */}
                                                {message.role === 'assistant' && (
                                                    <button
                                                        onClick={() => handleReadAloud(message.id, message.content)}
                                                        className={cn(
                                                            "mt-1 flex items-center gap-1 px-2 py-1 text-[10px] rounded-full transition-colors",
                                                            isPlaying && playingMessageId === message.id
                                                                ? "bg-primary/10 text-primary"
                                                                : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                        )}
                                                        title={isPlaying && playingMessageId === message.id ? "Stop" : "Read Aloud"}
                                                    >
                                                        {isPlaying && playingMessageId === message.id ? (
                                                            <>
                                                                <StopCircle className="w-3 h-3" />
                                                                <span>Stop</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Volume2 className="w-3 h-3" />
                                                                <span>Read Aloud</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                {/* Suggestions */}
                                                {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {message.suggestions.map((suggestion, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleSuggestionClick(suggestion)}
                                                                disabled={isLoading}
                                                                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-background border border-border rounded-full hover:bg-accent hover:border-primary/30 transition-colors disabled:opacity-50"
                                                            >
                                                                <Lightbulb className="w-2.5 h-2.5 text-yellow-500" />
                                                                {suggestion}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Related Topics */}
                                                {message.role === 'assistant' && message.relatedTopics && message.relatedTopics.length > 0 && (
                                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                                        {message.relatedTopics.map((topic, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleSuggestionClick(`Tell me about ${topic}`)}
                                                                disabled={isLoading}
                                                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground bg-muted/30 rounded hover:bg-muted transition-colors disabled:opacity-50"
                                                            >
                                                                <BookOpen className="w-2.5 h-2.5" />
                                                                {topic}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Loading indicator */}
                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-2"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center">
                                                <Bot className="w-3 h-3 text-primary-foreground" />
                                            </div>
                                            <div className="bg-muted/50 rounded-xl rounded-bl-sm px-3 py-2 border border-border/50">
                                                <div className="flex items-center gap-1.5">
                                                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                                    <span className="text-xs text-muted-foreground">Thinking...</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>
                        </motion.div>

                        {/* Input Area */}
                        <motion.div
                            layout="position"
                            className="shrink-0 p-3 border-t border-border bg-muted/30 rounded-b-2xl"
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask about tenses..."
                                        disabled={isLoading}
                                        className="w-full px-3 py-2 text-xs bg-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 placeholder:text-muted-foreground"
                                    />
                                </div>
                                <Button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading}
                                    size="icon-sm"
                                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                            <p className="text-[9px] text-muted-foreground text-center mt-1.5">
                                Powered by AI
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </LayoutGroup>
    )
}
