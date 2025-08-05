import { supabase } from './supabase'
import { conversations, messages, admin } from './supabase'

// Interface for admin statistics
export interface AdminStats {
  totalConversations: number
  activeSessions: number
  totalMessages: number
  averageResponseTime: number
  satisfactionRate: number
  errorRate: number
}

// Interface for recent conversation data
export interface RecentConversation {
  id: string
  sessionId: string
  startTime: string
  lastMessage: string
  messageCount: number
  status: "active" | "completed" | "error"
  userAgent: string
}

/**
 * Get admin statistics from Supabase
 */
export async function getAdminStats(): Promise<AdminStats> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    // Get conversation stats
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('id, status, created_at')
    
    if (convError) throw convError
    
    // Get message stats
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .select('id, is_user, conversation_id, timestamp')
    
    if (msgError) throw msgError
    
    // Get feedback stats
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select('id, is_positive')
    
    if (feedbackError) throw feedbackError
    
    // Calculate statistics
    const totalConversations = convData.length
    const activeSessions = convData.filter(c => c.status === 'active').length
    const totalMessages = msgData.length
    
    // Calculate response times
    let totalResponseTime = 0
    let responseCount = 0
    
    // Group messages by conversation
    const messagesByConversation = msgData.reduce((acc, msg) => {
      if (!acc[msg.conversation_id]) {
        acc[msg.conversation_id] = []
      }
      acc[msg.conversation_id].push(msg)
      return acc
    }, {} as Record<string, any[]>)
    
    // Calculate response times
    Object.values(messagesByConversation).forEach(messages => {
      // Sort messages by timestamp
      const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      
      // Calculate response time between user and bot messages
      for (let i = 1; i < sortedMessages.length; i++) {
        const prevMsg = sortedMessages[i-1]
        const currMsg = sortedMessages[i]
        
        if (prevMsg.is_user && !currMsg.is_user) {
          const prevTime = new Date(prevMsg.timestamp).getTime()
          const currTime = new Date(currMsg.timestamp).getTime()
          const responseTime = (currTime - prevTime) / 1000 // in seconds
          
          // Only count reasonable response times (less than 30 seconds)
          if (responseTime > 0 && responseTime < 30) {
            totalResponseTime += responseTime
            responseCount++
          }
        }
      }
    })
    
    const averageResponseTime = responseCount > 0 
      ? parseFloat((totalResponseTime / responseCount).toFixed(1)) 
      : 0
    
    // Calculate satisfaction rate from feedback
    const totalFeedback = feedbackData.length
    const positiveFeedback = feedbackData.filter(f => f.is_positive).length
    const satisfactionRate = totalFeedback > 0 
      ? parseFloat(((positiveFeedback / totalFeedback) * 100).toFixed(1)) 
      : 0
    
    // Calculate error rate
    const errorConversations = convData.filter(c => c.status === 'error').length
    const errorRate = totalConversations > 0 
      ? parseFloat(((errorConversations / totalConversations) * 100).toFixed(1)) 
      : 0
    
    return {
      totalConversations,
      activeSessions,
      totalMessages,
      averageResponseTime,
      satisfactionRate,
      errorRate
    }
  } catch (error) {
    console.error('Error getting admin stats:', error)
    return {
      totalConversations: 0,
      activeSessions: 0,
      totalMessages: 0,
      averageResponseTime: 0,
      satisfactionRate: 0,
      errorRate: 0
    }
  }
}

/**
 * Get recent conversations from Supabase
 */
export async function getRecentConversations(limit = 10): Promise<RecentConversation[]> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    // Get conversations
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('id, session_id, start_time, status, message_count, user_agent')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (convError) throw convError
    
    // Get last messages for each conversation
    const recentConversations: RecentConversation[] = []
    
    for (const conv of convData) {
      // Get last message
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .select('content, is_user')
        .eq('conversation_id', conv.id)
        .order('timestamp', { ascending: false })
        .limit(1)
      
      if (msgError) throw msgError
      
      // Find the last user message
      let lastMessage = 'No messages'
      if (msgData.length > 0) {
        lastMessage = msgData[0].is_user ? msgData[0].content : lastMessage
        
        // If the last message is not from a user, try to find the last user message
        if (!msgData[0].is_user) {
          const { data: userMsgData, error: userMsgError } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .eq('is_user', true)
            .order('timestamp', { ascending: false })
            .limit(1)
          
          if (!userMsgError && userMsgData.length > 0) {
            lastMessage = userMsgData[0].content
          }
        }
      }
      
      recentConversations.push({
        id: conv.id,
        sessionId: conv.session_id,
        startTime: conv.start_time,
        lastMessage,
        messageCount: conv.message_count || 0,
        status: conv.status as "active" | "completed" | "error",
        userAgent: conv.user_agent || 'Unknown'
      })
    }
    
    return recentConversations
  } catch (error) {
    console.error('Error getting recent conversations:', error)
    return []
  }
}

/**
 * Get conversation details
 */
export async function getConversationDetails(conversationId: string) {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    // Get conversation
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()
    
    if (convError) throw convError
    
    // Get messages
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true })
    
    if (msgError) throw msgError
    
    // Get feedback
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .eq('conversation_id', conversationId)
    
    if (feedbackError) throw feedbackError
    
    return {
      conversation: convData,
      messages: msgData,
      feedback: feedbackData
    }
  } catch (error) {
    console.error('Error getting conversation details:', error)
    return null
  }
}

/**
 * Get all users
 */
export async function getUsers() {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    return await admin.getUsers()
  } catch (error) {
    console.error('Error getting users:', error)
    return []
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: 'admin' | 'user') {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }
    
    return await admin.updateUserRole(userId, role)
  } catch (error) {
    console.error('Error updating user role:', error)
    return null
  }
}