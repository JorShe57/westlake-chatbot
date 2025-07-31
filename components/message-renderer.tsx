import type React from "react"
import { LinkParser } from "./link-parser"
import type { JSX } from "react/jsx-runtime"

interface StructuredMessagePart {
  type: "heading" | "list-item" | "text"
  content: string
  level?: number
}

interface Message {
  id: string
  isUser: boolean
  content: string
  formatted?: boolean
  message?: StructuredMessagePart[]
}

interface MessageRendererProps {
  message: Message
  isBot: boolean
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ message, isBot }) => {
  // If the message is not formatted or is a user message, use the LinkParser directly.
  if (!message.formatted || !isBot) {
    return <LinkParser content={message.content} />
  }

  // Render structured messages from the bot.
  return (
    <div className="structured-message">
      {message.message?.map((item, index) => {
        switch (item.type) {
          case "heading":
            const HeadingTag = `h${Math.min(item.level || 3, 6)}` as keyof JSX.IntrinsicElements
            return (
              <HeadingTag key={index} className="message-heading">
                {item.content}
              </HeadingTag>
            )
          case "list-item":
            return (
              <div key={index} className="message-list-item">
                <span className="bullet">•</span>
                <span className="content">
                  <LinkParser content={item.content} />
                </span>
              </div>
            )
          case "text":
            return (
              <p key={index} className="message-text">
                <LinkParser content={item.content} />
              </p>
            )
          default:
            return (
              <div key={index} className="message-text">
                <LinkParser content={item.content} />
              </div>
            )
        }
      })}
    </div>
  )
}

export default MessageRenderer
