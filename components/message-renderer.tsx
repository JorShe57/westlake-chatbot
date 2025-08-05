import type React from "react"
import { useState } from "react"
import { LinkParser } from "./link-parser"
import { MessageFeedback } from "./message-feedback"
import type { JSX } from "react/jsx-runtime"
import { AlertCircle, FileText, Check, X, ExternalLink, MapPin } from "lucide-react"

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
  content: string
  formatted?: boolean
  message?: StructuredMessagePart[]
  timestamp?: string
}

interface MessageRendererProps {
  message: Message
  isBot: boolean
  onFeedback?: (messageId: string, isPositive: boolean, comment?: string) => void
  showFeedback?: boolean
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ 
  message, 
  isBot, 
  onFeedback,
  showFeedback = true
}) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false)

  // Handle feedback submission
  const handleFeedback = (messageId: string, isPositive: boolean, comment?: string) => {
    if (onFeedback) {
      onFeedback(messageId, isPositive, comment)
    }
  }

  // If the message is not formatted or is a user message, use the LinkParser directly.
  if (!message.formatted || !isBot) {
    return (
      <div className="message-content">
        <LinkParser content={message.content} />
        {message.timestamp && (
          <div className="text-xs text-gray-400 mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    )
  }

  // Render structured messages from the bot.
  return (
    <div className="structured-message">
      {message.message?.map((item, index) => {
        switch (item.type) {
          case "heading":
            const HeadingTag = `h${Math.min(item.level || 3, 6)}` as keyof JSX.IntrinsicElements
            return (
              <HeadingTag 
                key={index} 
                className={`font-semibold mb-2 ${item.level === 1 ? 'text-lg' : item.level === 2 ? 'text-base' : 'text-sm'}`}
              >
                {item.content}
              </HeadingTag>
            )
          
          case "list-item":
            return (
              <div key={index} className="flex items-start space-x-2 mb-1 pl-1">
                <span className="text-[#2d5016] mt-1">•</span>
                <span className="flex-1">
                  <LinkParser content={item.content} />
                </span>
              </div>
            )
          
          case "text":
            return (
              <p key={index} className="mb-3">
                <LinkParser content={item.content} />
              </p>
            )
          
          case "alert":
            return (
              <div 
                key={index} 
                className={`flex p-3 rounded-md mb-3 ${
                  item.alertType === "warning" ? "bg-amber-50 text-amber-800 border-l-4 border-amber-500" :
                  item.alertType === "error" ? "bg-red-50 text-red-800 border-l-4 border-red-500" :
                  item.alertType === "success" ? "bg-green-50 text-green-800 border-l-4 border-green-500" :
                  "bg-blue-50 text-blue-800 border-l-4 border-blue-500"
                }`}
              >
                <div className="mr-2 mt-0.5">
                  {item.alertType === "warning" && <AlertCircle className="h-4 w-4 text-amber-500" />}
                  {item.alertType === "error" && <X className="h-4 w-4 text-red-500" />}
                  {item.alertType === "success" && <Check className="h-4 w-4 text-green-500" />}
                  {(item.alertType === "info" || !item.alertType) && <AlertCircle className="h-4 w-4 text-blue-500" />}
                </div>
                <div>
                  <LinkParser content={item.content} />
                </div>
              </div>
            )
          
          case "file":
            return (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-md mb-3 border border-gray-200">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <div className="flex-1">
                  <div className="font-medium">{item.content}</div>
                  {item.url && (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 flex items-center mt-1 hover:underline"
                    >
                      View Document <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            )
          
          case "location":
            return (
              <div key={index} className="mb-3">
                <div className="flex items-center mb-1">
                  <MapPin className="h-4 w-4 text-red-500 mr-1" />
                  <span className="font-medium">{item.content}</span>
                </div>
                {item.url && (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 flex items-center mt-1 hover:underline"
                  >
                    View on Map <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            )
          
          case "image":
            return (
              <div key={index} className="mb-3">
                {item.imageUrl && (
                  <div className="relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.content || "Image"} 
                      className={`rounded-md border border-gray-200 cursor-pointer ${
                        isImageExpanded ? "w-full" : "max-h-48 object-cover"
                      }`}
                      onClick={() => setIsImageExpanded(!isImageExpanded)}
                    />
                    {item.content && (
                      <div className="text-sm text-gray-500 mt-1">{item.content}</div>
                    )}
                  </div>
                )}
              </div>
            )
          
          case "divider":
            return (
              <hr key={index} className="my-3 border-gray-200" />
            )
          
          default:
            return (
              <div key={index} className="mb-3">
                <LinkParser content={item.content} />
              </div>
            )
        }
      })}
      
      {/* Message timestamp */}
      {message.timestamp && (
        <div className="text-xs text-gray-400 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      
      {/* Message feedback */}
      {isBot && showFeedback && onFeedback && (
        <MessageFeedback 
          messageId={message.id} 
          onFeedback={handleFeedback}
        />
      )}
    </div>
  )
}

export default MessageRenderer
