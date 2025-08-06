"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageRenderer } from "@/components/message-renderer"
import { Navigation } from "@/components/navigation"
import { config } from "@/lib/config"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Send, 
  MessageSquare, 
  Clock, 
  User, 
  Bot,
  Loader2,
  RefreshCw,
  ExternalLink
} from "lucide-react"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
  formatted?: boolean
  message?: any[]
}

export default function WestlakeChatbot() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Add welcome message on component mount
  useEffect(() => {
    const welcomeMessage: Message = {
      id: `welcome_${Date.now()}`,
      content: config.chatbot.welcomeMessage,
      isUser: false,
      timestamp: new Date().toISOString(),
      formatted: false
    }
    setMessages([welcomeMessage])
  }, [])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = inputMessage.trim()
    setInputMessage("")
    setIsLoading(true)

    try {
      const requestBody = {
        message: messageText,
        sessionId,
        userId: user?.id || 'anonymous',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`)
      }

      const data = await response.json()
      
      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        content: data.bot_response || data.message || data.response || "I'm sorry, I couldn't generate a response.",
        isUser: false,
        timestamp: new Date().toISOString(),
        formatted: data.formatted || false,
        message: data.structuredMessage || data.message_data
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      let errorContent = config.errors.networkError
      if (error?.message?.includes('404')) {
        errorContent = "I'm sorry, the chat service is temporarily unavailable (404 error). Please try again later or contact City Hall directly."
      } else if (error?.message?.includes('500')) {
        errorContent = "I'm sorry, there's a temporary issue with the chat service. Please try again in a moment."
      }
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: errorContent,
        isUser: false,
        timestamp: new Date().toISOString(),
        formatted: false
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startNewConversation = () => {
    setMessages([{
      id: `welcome_${Date.now()}`,
      content: config.chatbot.welcomeMessage,
      isUser: false,
      timestamp: new Date().toISOString(),
      formatted: false
    }])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Navigation 
        title="Westlake Virtual Assistant" 
        subtitle="Chat with our AI assistant"
        showBackButton={true}
        backButtonHref="/"
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/westlake-city-hall.jpg" alt="City of Westlake" />
                    <AvatarFallback className="bg-[#2d5016] text-white">WL</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">City of Westlake Assistant</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      Online and ready to help
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startNewConversation}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>New Chat</span>
                </Button>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          message.isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!message.isUser && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src="/westlake-city-hall.jpg" alt="Assistant" />
                            <AvatarFallback className="bg-[#2d5016] text-white text-xs">
                              <Bot className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                            message.isUser
                              ? "rounded-br-none bg-[#2d5016] text-white"
                              : "rounded-bl-none border bg-white text-gray-800"
                          }`}
                        >
                          <MessageRenderer 
                            message={message} 
                            isBot={!message.isUser}
                            showFeedback={!message.isUser}
                          />
                        </div>
                        
                        {message.isUser && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src="/placeholder-user.jpg" alt="You" />
                            <AvatarFallback className="bg-gray-500 text-white text-xs">
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex items-start gap-3 justify-start">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src="/westlake-city-hall.jpg" alt="Assistant" />
                          <AvatarFallback className="bg-[#2d5016] text-white text-xs">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="max-w-[85%] rounded-2xl rounded-bl-none border bg-white px-4 py-3 shadow-sm">
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Assistant is typing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Input Area */}
                <div className="border-t bg-gray-50 p-4">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Input
                        ref={inputRef}
                        placeholder="Ask me anything about city services..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="resize-none border-0 bg-white shadow-sm focus-visible:ring-1"
                        maxLength={config.chatbot.maxMessageLength}
                      />
                    </div>
                    <Button 
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      size="icon"
                      className="bg-[#2d5016] hover:bg-[#223d11] shrink-0"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>Press Enter to send</span>
                    <span>{inputMessage.length}/{config.chatbot.maxMessageLength}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {config.quickActions.slice(0, 4).map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-sm font-medium">{action.name}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                  </a>
                ))}
              </CardContent>
            </Card>

            {/* Quick Prompts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Popular Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {config.quickPrompts.slice(0, 4).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputMessage(prompt)
                      inputRef.current?.focus()
                    }}
                    className="w-full text-left p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    <span className="text-sm">{prompt}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Need More Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">City Hall</p>
                  <p className="text-xs text-gray-600">{config.city.phone}</p>
                  <p className="text-xs text-gray-600">Mon-Fri: 8:00 AM - 5:00 PM</p>
                </div>
                <Badge variant="outline" className="w-fit">
                  Emergency: 911
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 