import { supabase, conversations, messages } from './supabase'
import { config } from './config'

// Interface for chat messages
export interface ChatMessage {
  id: string
  isUser: boolean
  content: string
  formatted?: boolean
  message?: any
  timestamp?: string
  feedback?: {
    isPositive: boolean
    comment?: string
  }
}

// Interface for conversation metadata
export interface ConversationMetadata {
  id: string
  sessionId: string
  userId?: string
  startTime: string
  endTime?: string
  status: 'active' | 'completed' | 'error'
  messageCount: number
  userAgent: string
  ipAddress: string
}

/**
 * Creates a new conversation in Supabase
 */
export async function createConversation(
  sessionId: string,
  userAgent: string,
  ipAddress: string,
  userId?: string
): Promise<string | null> {
  try {
    if (!supabase) {
      console.warn('Supabase not configured, conversation not stored')
      return null
    }

    const conversation = await conversations.create(
      sessionId,
      userAgent,
      ipAddress,
      userId
    )
    
    return conversation.id
  } catch (error) {
    console.error('Error creating conversation:', error)
    return null
  }
}

/**
 * Stores a message in Supabase
 */
export async function storeMessage(
  conversationId: string | null,
  message: ChatMessage
): Promise<boolean> {
  try {
    if (!supabase || !conversationId) {
      return false
    }

    // Format message for storage
    const messageData = {
      is_user: message.isUser,
      content: message.content,
      formatted: message.formatted || false,
      message_data: message.formatted ? message.message : null,
      timestamp: message.timestamp || new Date().toISOString(),
    }

    await messages.add(conversationId, messageData)

    // Update message count in conversation
    await conversations.update(conversationId, {
      message_count: await getMessageCount(conversationId),
      updated_at: new Date().toISOString()
    })

    return true
  } catch (error) {
    console.error('Error storing message:', error)
    return false
  }
}

/**
 * Get message count for a conversation
 */
async function getMessageCount(conversationId: string): Promise<number> {
  try {
    if (!supabase) return 0
    
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      
    if (error) throw error
    return data.length
  } catch (error) {
    console.error('Error getting message count:', error)
    return 0
  }
}

/**
 * Stores user feedback for a message
 */
export async function storeFeedback(
  conversationId: string | null,
  messageId: string,
  isPositive: boolean,
  comment?: string
): Promise<boolean> {
  try {
    if (!supabase || !conversationId) {
      return false
    }

    // Find the message in the database
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: false })
      .limit(50)
    
    if (error) throw error
    
    // Store feedback in a separate table
    const { error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        message_id: messageId,
        conversation_id: conversationId,
        is_positive: isPositive,
        comment: comment || null,
        created_at: new Date().toISOString()
      })
    
    if (feedbackError) throw feedbackError
    
    return true
  } catch (error) {
    console.error('Error storing feedback:', error)
    return false
  }
}

/**
 * Completes a conversation
 */
export async function completeConversation(
  conversationId: string | null,
  status: 'completed' | 'error' = 'completed'
): Promise<boolean> {
  try {
    if (!supabase || !conversationId) {
      return false
    }

    await conversations.update(conversationId, {
      status,
      end_time: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
    return true
  } catch (error) {
    console.error('Error completing conversation:', error)
    return false
  }
}

/**
 * Loads conversation history for a session
 */
export async function loadConversationHistory(
  sessionId: string
): Promise<ChatMessage[]> {
  try {
    if (!supabase) {
      return []
    }

    // Get conversation
    const conversation = await conversations.getBySessionId(sessionId)
    if (!conversation) return []

    // Get messages
    const messageData = await messages.getByConversation(conversation.id)
    
    // Convert to ChatMessage format
    return messageData.map(msg => ({
      id: msg.id,
      isUser: msg.is_user,
      content: msg.content,
      formatted: msg.formatted || false,
      message: msg.message_data,
      timestamp: msg.timestamp
    }))
  } catch (error) {
    console.error('Error loading conversation history:', error)
    return []
  }
}

/**
 * Checks if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!supabase
}