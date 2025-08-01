"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, MessageCircle, FileText, CreditCard, Video, AlertTriangle, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import MessageRenderer from "@/components/message-renderer"
import { config } from "@/lib/config"

interface StructuredMessagePart {
  type: "heading" | "list-item" | "text"
  content: string
  level?: number
}

interface Message {
  id: string
  isUser: boolean
  content: string // Used for user messages and as a fallback for simple bot messages
  formatted?: boolean
  message?: StructuredMessagePart[]
}

const popularTopics = config.popularTopics
const quickActions = config.quickActions
const quickPrompts = config.quickPrompts

export default function WestlakeChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: config.chatbot.welcomeMessage,
      isUser: false,
      formatted: false,
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showQuickPrompts, setShowQuickPrompts] = useState(true)

  useEffect(() => {
    // Generate a unique session ID on component mount
    setSessionId(Date.now().toString(36) + Math.random().toString(36).substring(2))
  }, []) // Empty dependency array ensures this runs only once

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !sessionId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      formatted: false,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch(
        config.n8n.webhookUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId,
            message: inputMessage,
            timestamp: new Date().toISOString(),
          }),
        },
      )

      const data = await response.json()
      let botMessage: Message

      // Check if the response is a structured message
      if (data.formatted && Array.isArray(data.message)) {
        botMessage = {
          id: (Date.now() + 1).toString(),
          isUser: false,
          content: "", // Not needed for formatted messages
          formatted: true,
          message: data.message,
        }
      } else {
        // Handle as a simple text response
        const botResponseContent =
          data.bot_response ||
          data.response ||
          data.message ||
          data.text ||
          data.output ||
          (typeof data.data === "string" ? data.data : null) ||
          config.errors.networkError

        botMessage = {
          id: (Date.now() + 1).toString(),
          isUser: false,
          content: botResponseContent,
          formatted: false,
        }
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: config.errors.networkError,
        isUser: false,
        formatted: false,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt)
    setShowQuickPrompts(false)
    // Auto-send the message
    setTimeout(() => {
      const event = new KeyboardEvent("keypress", { key: "Enter" })
      handleKeyPress(event as any)
    }, 100)
  }

  const SidebarContent = () => (
    <div className="flex flex-col space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="mt-6 space-y-2">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group -mx-3 flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <action.icon className="mr-3 h-5 w-5 text-green-300" />
              <span>{action.name}</span>
            </a>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold">Popular Topics</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {popularTopics.map((topic) => (
            <a
              key={topic.name}
              href={topic.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/20 hover:text-white"
            >
              {topic.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden w-full max-w-xs flex-col bg-[#2d5016] text-white md:flex">
        <SidebarContent />
      </aside>

      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col">
        <div className="m-0 flex h-screen flex-col rounded-none bg-white shadow-lg md:m-4 md:h-[calc(100vh-2rem)] md:rounded-xl">
          <CardHeader className="flex flex-row items-center space-x-4 border-b bg-[#2d5016] p-4 text-white md:rounded-t-xl">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs bg-[#2d5016] p-0 text-white border-none">
                <SheetHeader className="p-6 pb-0">
                  <SheetTitle className="text-2xl font-bold text-white">Menu</SheetTitle>
                </SheetHeader>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar>
                  <AvatarImage src="/westlake-city-hall.jpg" alt="Westlake City Hall" />
                  <AvatarFallback>WL</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#2d5016]" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-lg font-bold">Westlake Virtual Assistant</CardTitle>
                <p className="text-sm text-green-100">Online and ready to help</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
            {showQuickPrompts && messages.length === 1 && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-gray-600">Quick questions to get you started:</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="rounded-lg border border-gray-200 bg-white p-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:border-[#2d5016] focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:ring-offset-2"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                {!message.isUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/westlake-city-hall.jpg" alt="Westlake City Hall" />
                    <AvatarFallback>WL</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.isUser
                      ? "rounded-br-none bg-[#2d5016] text-white"
                      : "rounded-bl-none border bg-gray-100 text-gray-800"
                  }`}
                >
                  <MessageRenderer message={message} isBot={!message.isUser} />
                </div>
                {message.isUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/westlake-city-hall.jpg" alt="Westlake City Hall" />
                  <AvatarFallback>WL</AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-2 rounded-2xl rounded-bl-none border bg-gray-100 px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="rounded-b-xl border-t bg-white p-2 md:p-4">
            <div className="relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="w-full rounded-full border-gray-300 bg-gray-100 py-6 pl-5 pr-16 text-sm focus-visible:ring-2 focus-visible:ring-[#2d5016]"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#2d5016] text-white transition-colors hover:bg-[#223d11] focus-visible:ring-2 focus-visible:ring-[#2d5016] focus-visible:ring-offset-2 disabled:bg-gray-400"
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 