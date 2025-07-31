"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  Download, 
  Share, 
  Clock, 
  User, 
  Smartphone,
  Globe,
  MessageSquare,
  AlertTriangle
} from "lucide-react"
import MessageRenderer from "@/components/message-renderer"

interface Message {
  id: string
  isUser: boolean
  content: string
  timestamp: string
  formatted?: boolean
  message?: any[]
}

interface ConversationDetails {
  id: string
  sessionId: string
  startTime: string
  endTime?: string
  status: "active" | "completed" | "error"
  messageCount: number
  userAgent: string
  ipAddress: string
  location: string
  messages: Message[]
}

export default function ConversationDetail() {
  const params = useParams()
  const router = useRouter()
  const [conversation, setConversation] = useState<ConversationDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockConversation: ConversationDetails = {
      id: params.id as string,
      sessionId: "abc123",
      startTime: "2024-01-15T10:30:00Z",
      endTime: "2024-01-15T10:45:00Z",
      status: "completed",
      messageCount: 12,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      ipAddress: "192.168.1.100",
      location: "Westlake, OH",
      messages: [
        {
          id: "1",
          isUser: false,
          content: "Hello! I'm the City of Westlake virtual assistant. How can I help you today? Feel free to ask about city services, department information, permits, or general questions.",
          timestamp: "2024-01-15T10:30:00Z",
          formatted: false
        },
        {
          id: "2",
          isUser: true,
          content: "How do I apply for a building permit?",
          timestamp: "2024-01-15T10:31:00Z",
          formatted: false
        },
        {
          id: "3",
          isUser: false,
          content: "To apply for a building permit in Westlake, you'll need to follow these steps:\n\n1. **Visit the Building Department** at City Hall (27700 Hilliard Blvd)\n2. **Complete the application form** - available online or in person\n3. **Submit required documents** including:\n   - Site plan\n   - Construction drawings\n   - Property survey\n4. **Pay the permit fee** based on project value\n5. **Wait for approval** (typically 5-10 business days)\n\nYou can also apply online through our portal: https://egov.cityofwestlake.org\n\nFor questions, call the Building Department at (440) 871-3300.",
          timestamp: "2024-01-15T10:31:30Z",
          formatted: true,
          message: [
            { type: "text", content: "To apply for a building permit in Westlake, you'll need to follow these steps:" },
            { type: "list-item", content: "**Visit the Building Department** at City Hall (27700 Hilliard Blvd)" },
            { type: "list-item", content: "**Complete the application form** - available online or in person" },
            { type: "list-item", content: "**Submit required documents** including:" },
            { type: "list-item", content: "   - Site plan" },
            { type: "list-item", content: "   - Construction drawings" },
            { type: "list-item", content: "   - Property survey" },
            { type: "list-item", content: "**Pay the permit fee** based on project value" },
            { type: "list-item", content: "**Wait for approval** (typically 5-10 business days)" },
            { type: "text", content: "You can also apply online through our portal: https://egov.cityofwestlake.org\n\nFor questions, call the Building Department at (440) 871-3300." }
          ]
        },
        {
          id: "4",
          isUser: true,
          content: "What are the fees for a residential addition?",
          timestamp: "2024-01-15T10:33:00Z",
          formatted: false
        },
        {
          id: "5",
          isUser: false,
          content: "Building permit fees for residential additions are calculated based on the total project value:\n\n- **$0 - $1,000**: $50\n- **$1,001 - $5,000**: $50 + $5 per $1,000 over $1,000\n- **$5,001 - $10,000**: $70 + $4 per $1,000 over $5,000\n- **Over $10,000**: $90 + $3 per $1,000 over $10,000\n\nFor example, a $25,000 addition would cost approximately $135 in permit fees.\n\nYou can get an exact quote by calling the Building Department at (440) 871-3300 or visiting City Hall.",
          timestamp: "2024-01-15T10:33:30Z",
          formatted: false
        }
      ]
    }

    setConversation(mockConversation)
    setLoading(false)
  }, [params.id])

  const handleExport = () => {
    if (!conversation) return
    
    const exportData = {
      conversationId: conversation.id,
      sessionId: conversation.sessionId,
      startTime: conversation.startTime,
      endTime: conversation.endTime,
      messageCount: conversation.messageCount,
      messages: conversation.messages
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-${conversation.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">Conversation Not Found</CardTitle>
            <CardDescription>
              The requested conversation could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/admin')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/admin')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-[#2d5016]">
                  Conversation Details
                </h1>
                <p className="text-sm text-gray-500">
                  Session: {conversation.sessionId}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conversation Messages */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Message History</CardTitle>
                    <CardDescription>
                      {conversation.messageCount} messages • {new Date(conversation.startTime).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      conversation.status === "active" ? "default" :
                      conversation.status === "completed" ? "secondary" : "destructive"
                    }
                  >
                    {conversation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {conversation.messages.map((message) => (
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
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      {message.isUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversation Metadata */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Started</p>
                    <p className="text-xs text-gray-500">
                      {new Date(conversation.startTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                {conversation.endTime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Ended</p>
                      <p className="text-xs text-gray-500">
                        {new Date(conversation.endTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Messages</p>
                    <p className="text-xs text-gray-500">
                      {conversation.messageCount} total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">IP Address</p>
                    <p className="text-xs text-gray-500">{conversation.ipAddress}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-xs text-gray-500">{conversation.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Device</p>
                    <p className="text-xs text-gray-500">
                      {conversation.userAgent.includes('iPhone') ? 'iPhone' : 
                       conversation.userAgent.includes('Android') ? 'Android' : 
                       conversation.userAgent.includes('Windows') ? 'Windows' : 
                       conversation.userAgent.includes('Mac') ? 'Mac' : 'Unknown'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {conversation.status === "error" && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Error Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-700">
                    This conversation encountered an error. Check the n8n workflow logs for more details.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 