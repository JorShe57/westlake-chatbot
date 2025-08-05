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
import { useAuth } from "@/contexts/AuthContext"
import { 
  createConversation, 
  storeMessage, 
  storeFeedback, 
  completeConversation,
  loadConversationHistory,
  isSupabaseConfigured
} from "@/lib/chat-storage"

interface StructuredMessagePart {
  type: "heading" | "list-item" | "text" | "alert" | "success" | "error" | "file" | "location" | "image" | "divider"
  content: string
  level?: number
  url?: string
  imageUrl?: string
  alertType?: "info" | "warning" | "error" | "success"
}

interface Message {
  id: string
  isUser: boolean
  content: string // Used for user messages and as a fallback for simple bot messages
  formatted?: boolean
  message?: StructuredMessagePart[]
  timestamp?: string
  feedback?: {
    isPositive: boolean
    comment?: string
  }
}

const popularTopics = config.popularTopics
const quickActions = config.quickActions
const quickPrompts = config.quickPrompts

export default function WestlakeChatbot() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: config.chatbot.welcomeMessage,
      isUser: false,
      formatted: false,
      timestamp: new Date().toISOString()
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [sessionId, setSessionId] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [supabaseEnabled, setSupabaseEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showQuickPrompts, setShowQuickPrompts] = useState(true)

  useEffect(() => {
    // Generate a unique session ID on component mount
    const newSessionId = Date.now().toString(36) + Math.random().toString(36).substring(2)
    setSessionId(newSessionId)
    
    // Check if Supabase is configured
    const supabaseConfig = isSupabaseConfigured()
    setSupabaseEnabled(supabaseConfig)
    
    // Initialize conversation
    const initConversation = async () => {
      if (supabaseConfig) {
        try {
          // Get user agent and IP address
          const userAgent = navigator.userAgent
          const ipAddress = "127.0.0.1" // In a real app, you'd get this from the server
          
          // Create conversation in Supabase
          const convId = await createConversation(
            newSessionId,
            userAgent,
            ipAddress,
            user?.id
          )
          
          setConversationId(convId)
          
          // Store welcome message
          if (convId) {
            await storeMessage(convId, messages[0])
          }
          
          // Load conversation history if it exists
          const history = await loadConversationHistory(newSessionId)
          if (history.length > 1) { // More than just the welcome message
            setMessages(history)
          }
        } catch (error) {
          console.error("Error initializing conversation:", error)
        }
      }
    }
    
    initConversation()
    
    // Clean up on unmount
    return () => {
      if (supabaseEnabled && conversationId) {
        completeConversation(conversationId)
          .catch(error => console.error("Error completing conversation:", error))
      }
    }
  }, []) // Empty dependency array ensures this runs only once

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle message feedback
  const handleFeedback = (messageId: string, isPositive: boolean, comment?: string) => {
    setMessages((prev) => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedback: { isPositive, comment } } 
          : msg
      )
    )
    
    // Store feedback in Supabase if enabled
    if (supabaseEnabled && conversationId) {
      storeFeedback(conversationId, messageId, isPositive, comment)
        .catch(error => console.error("Error storing feedback:", error))
    }
    
    // Send feedback to n8n webhook as well
    if (sessionId) {
      fetch(config.n8n.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          messageId: messageId,
          feedback: { isPositive, comment },
          type: "feedback",
          timestamp: new Date().toISOString(),
        }),
      }).catch(error => {
        console.error("Error sending feedback:", error)
      })
    }
  }

  // Simulate typing indicator
  const simulateTyping = () => {
    setIsTyping(true)
    
    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    // Set a random typing duration between 1-3 seconds
    const typingDuration = Math.floor(Math.random() * 2000) + 1000
    const timeout = setTimeout(() => {
      setIsTyping(false)
    }, typingDuration)
    
    setTypingTimeout(timeout)
  }
  
  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [typingTimeout])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !sessionId) return

    const timestamp = new Date().toISOString()
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      formatted: false,
      timestamp,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    simulateTyping() // Start typing indicator
    
    // Store user message in Supabase if enabled
    if (supabaseEnabled && conversationId) {
      storeMessage(conversationId, userMessage)
        .catch(error => console.error("Error storing user message:", error))
    }

    try {
      const response = await fetch(
        config.n8n.webhookUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId,
            message: inputMessage,
            timestamp,
            conversationId: conversationId // Pass the conversation ID to n8n if available
          }),
        },
      )

      const data = await response.json()
      const responseTimestamp = new Date().toISOString()
      let botMessage: Message

      // Check if the response is a structured message or plain text
      if (data.formatted === true && Array.isArray(data.message)) {
        // Structured format
        botMessage = {
          id: (Date.now() + 1).toString(),
          isUser: false,
          content: "", // Not needed for formatted messages
          formatted: true,
          message: data.message,
          timestamp: responseTimestamp,
        }
      } else if (data.formatted === false && typeof data.message === 'string') {
        // New n8n format with formatted: false and message as plain text
        botMessage = {
          id: (Date.now() + 1).toString(),
          isUser: false,
          content: data.message,
          formatted: false,
          timestamp: responseTimestamp,
        }
      } else {
        // Fallback for other response formats
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
          timestamp: responseTimestamp,
        }
      }
      
      // Add a small delay before showing the response to make it feel more natural
      setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => [...prev, botMessage])
        
        // Store bot message in Supabase if enabled
        if (supabaseEnabled && conversationId) {
          storeMessage(conversationId, botMessage)
            .catch(error => console.error("Error storing bot message:", error))
        }
        
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: config.errors.networkError,
        isUser: false,
        formatted: false,
        timestamp: new Date().toISOString(),
      }
      setIsTyping(false)
      setMessages((prev) => [...prev, errorMessage])
      
      // Store error message in Supabase if enabled
      if (supabaseEnabled && conversationId) {
        storeMessage(conversationId, errorMessage)
          .catch(error => console.error("Error storing error message:", error))
      }
      
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

          <CardContent className="flex-1 space-y-4 sm:space-y-6 overflow-y-auto p-2 sm:p-4 md:p-6">
            {showQuickPrompts && messages.length === 1 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="mb-2 sm:mb-3 text-xs sm:text-sm font-medium text-gray-600">Quick questions to get you started:</h3>
                <div className="grid grid-cols-1 gap-1.5 sm:gap-2 sm:grid-cols-2">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="rounded-lg border border-gray-200 bg-white p-2 sm:p-3 text-left text-xs sm:text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:border-[#2d5016] focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:ring-offset-2"
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
                className={`flex items-end gap-2 sm:gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                {!message.isUser && (
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarImage src="/westlake-city-hall.jpg" alt="Westlake City Hall" />
                    <AvatarFallback>WL</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm text-sm ${
                    message.isUser
                      ? "rounded-br-none bg-[#2d5016] text-white"
                      : "rounded-bl-none border bg-gray-100 text-gray-800"
                  }`}
                >
                  <MessageRenderer 
                    message={message} 
                    isBot={!message.isUser} 
                    onFeedback={handleFeedback}
                    showFeedback={!message.isUser && !message.feedback}
                  />
                  {message.timestamp && (
                    <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
                {message.isUser && (
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {(isLoading || isTyping) && (
              <div className="flex items-end gap-2 sm:gap-3">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                  <AvatarImage src="/westlake-city-hall.jpg" alt="Westlake City Hall" />
                  <AvatarFallback>WL</AvatarFallback>
                </Avatar>
                <div className="flex flex-col rounded-2xl rounded-bl-none border bg-gray-100 px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-pulse rounded-full bg-gray-400" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-400 mt-1">Westlake Assistant is typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="rounded-b-xl border-t bg-white p-2 md:p-4 pb-safe">
            <div className="relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="w-full rounded-full border-gray-300 bg-gray-100 py-5 sm:py-6 pl-4 sm:pl-5 pr-12 sm:pr-16 text-sm focus-visible:ring-2 focus-visible:ring-[#2d5016]"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#2d5016] text-white transition-colors hover:bg-[#223d11] focus-visible:ring-2 focus-visible:ring-[#2d5016] focus-visible:ring-offset-2 disabled:bg-gray-400"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 