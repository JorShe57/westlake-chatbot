import { supabase, conversations, messages } from './supabase'

// Interface for dashboard data
export interface UserDashboardData {
  recentConversations: ConversationSummary[]
  submissionRequests: SubmissionRequest[]
  stats: UserStats
}

export interface ConversationSummary {
  id: string
  sessionId: string
  startTime: string
  lastMessage: string
  messageCount: number
  status: 'active' | 'completed' | 'error'
  topic?: string
  satisfaction?: number
}

export interface SubmissionRequest {
  id: string
  type: 'permit' | 'concern' | 'form' | 'payment'
  title: string
  description: string
  status: 'submitted' | 'in_review' | 'approved' | 'rejected' | 'completed'
  progress: number // 0-100
  submittedAt: string
  updatedAt: string
  caseNumber?: string
  department?: string
  estimatedCompletion?: string
}

export interface UserStats {
  totalConversations: number
  totalSubmissions: number
  avgResponseTime: number
  satisfactionRate: number
  activeRequests: number
}

/**
 * Get comprehensive dashboard data for a user
 */
export async function getUserDashboardData(userId: string): Promise<UserDashboardData> {
  try {
    if (!supabase) {
      // Return mock data if Supabase is not configured
      return getMockDashboardData()
    }

    const [conversationsData, submissionsData, statsData] = await Promise.all([
      getUserConversations(userId),
      getUserSubmissionRequests(userId),
      getUserStats(userId)
    ])

    return {
      recentConversations: conversationsData,
      submissionRequests: submissionsData,
      stats: statsData
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return getMockDashboardData()
  }
}

/**
 * Get user's recent conversations with summary
 */
export async function getUserConversations(userId: string): Promise<ConversationSummary[]> {
  if (!supabase) return []

  try {
    // Get user's conversations
    const userConversations = await conversations.getByUser(userId)
    
    // Get the last message for each conversation
    const conversationSummaries = await Promise.all(
      userConversations.slice(0, 10).map(async (conv) => {
        try {
          const conversationMessages = await messages.getByConversation(conv.id)
          const lastMessage = conversationMessages[conversationMessages.length - 1]
          
          // Extract topic from first user message
          const firstUserMessage = conversationMessages.find(m => m.is_user)
          const topic = firstUserMessage 
            ? extractTopicFromMessage(firstUserMessage.content)
            : 'General inquiry'

          return {
            id: conv.id,
            sessionId: conv.session_id,
            startTime: conv.start_time || conv.created_at,
            lastMessage: lastMessage?.content || 'No messages',
            messageCount: conv.message_count,
            status: conv.status,
            topic,
            satisfaction: await getConversationSatisfaction(conv.id)
          } as ConversationSummary
        } catch (error) {
          console.error('Error processing conversation:', error)
          return {
            id: conv.id,
            sessionId: conv.session_id,
            startTime: conv.start_time || conv.created_at,
            lastMessage: 'Error loading messages',
            messageCount: conv.message_count,
            status: conv.status,
            topic: 'Unknown'
          } as ConversationSummary
        }
      })
    )

    return conversationSummaries
  } catch (error) {
    console.error('Error fetching user conversations:', error)
    return []
  }
}

/**
 * Get user's submission requests with progress tracking
 */
export async function getUserSubmissionRequests(userId: string): Promise<SubmissionRequest[]> {
  if (!supabase) return getMockSubmissionRequests()

  try {
    // Check if submissions table exists, if not return mock data
    const { data, error } = await supabase
      .from('submission_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Submissions table not found, using mock data:', error)
      return getMockSubmissionRequests()
    }

    return data.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      status: item.status,
      progress: calculateProgress(item.status),
      submittedAt: item.created_at,
      updatedAt: item.updated_at,
      caseNumber: item.case_number,
      department: item.department,
      estimatedCompletion: item.estimated_completion
    }))
  } catch (error) {
    console.error('Error fetching submission requests:', error)
    return getMockSubmissionRequests()
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  if (!supabase) {
    return {
      totalConversations: 8,
      totalSubmissions: 3,
      avgResponseTime: 2.1,
      satisfactionRate: 92,
      activeRequests: 1
    }
  }

  try {
    // Get conversation count
    const { data: conversationData } = await supabase
      .from('conversations')
      .select('id, status')
      .eq('user_id', userId)

    // Get submission count
    const { data: submissionData } = await supabase
      .from('submission_requests')
      .select('id, status')
      .eq('user_id', userId)

    // Get feedback data for satisfaction rate
    const { data: feedbackData } = await supabase
      .from('feedback')
      .select('is_positive')
      .eq('user_id', userId)

    const totalConversations = conversationData?.length || 0
    const totalSubmissions = submissionData?.length || 0
    const activeRequests = submissionData?.filter(s => 
      ['submitted', 'in_review'].includes(s.status)
    ).length || 0

    const positiveFeedback = feedbackData?.filter(f => f.is_positive).length || 0
    const totalFeedback = feedbackData?.length || 1
    const satisfactionRate = Math.round((positiveFeedback / totalFeedback) * 100)

    return {
      totalConversations,
      totalSubmissions,
      avgResponseTime: 2.3, // This would need more complex calculation
      satisfactionRate,
      activeRequests
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      totalConversations: 0,
      totalSubmissions: 0,
      avgResponseTime: 0,
      satisfactionRate: 0,
      activeRequests: 0
    }
  }
}

/**
 * Extract topic from message content
 */
function extractTopicFromMessage(content: string): string {
  const lowerContent = content.toLowerCase()
  
  if (lowerContent.includes('permit') || lowerContent.includes('building')) {
    return 'Building Permits'
  } else if (lowerContent.includes('trash') || lowerContent.includes('recycling')) {
    return 'Waste Management'
  } else if (lowerContent.includes('water') || lowerContent.includes('bill')) {
    return 'Utilities'
  } else if (lowerContent.includes('council') || lowerContent.includes('meeting')) {
    return 'City Council'
  } else if (lowerContent.includes('park') || lowerContent.includes('recreation')) {
    return 'Parks & Recreation'
  } else if (lowerContent.includes('report') || lowerContent.includes('concern')) {
    return 'Report Issue'
  } else {
    return 'General Inquiry'
  }
}

/**
 * Get conversation satisfaction from feedback
 */
async function getConversationSatisfaction(conversationId: string): Promise<number | undefined> {
  if (!supabase) return undefined

  try {
    const { data } = await supabase
      .from('feedback')
      .select('is_positive')
      .eq('conversation_id', conversationId)

    if (!data || data.length === 0) return undefined

    const positive = data.filter(f => f.is_positive).length
    return Math.round((positive / data.length) * 100)
  } catch (error) {
    return undefined
  }
}

/**
 * Calculate progress percentage based on status
 */
function calculateProgress(status: string): number {
  switch (status) {
    case 'submitted': return 25
    case 'in_review': return 50
    case 'approved': return 75
    case 'completed': return 100
    case 'rejected': return 100
    default: return 0
  }
}

/**
 * Get mock dashboard data for demo purposes
 */
function getMockDashboardData(): UserDashboardData {
  return {
    recentConversations: [
      {
        id: '1',
        sessionId: 'mock-session-1',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastMessage: 'Thank you! I found the building permit information I needed.',
        messageCount: 8,
        status: 'completed',
        topic: 'Building Permits',
        satisfaction: 95
      },
      {
        id: '2',
        sessionId: 'mock-session-2',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastMessage: 'What are the hours for the parks department?',
        messageCount: 4,
        status: 'active',
        topic: 'Parks & Recreation'
      },
      {
        id: '3',
        sessionId: 'mock-session-3',
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        lastMessage: 'Perfect, I submitted my concern report.',
        messageCount: 6,
        status: 'completed',
        topic: 'Report Issue',
        satisfaction: 88
      }
    ],
    submissionRequests: getMockSubmissionRequests(),
    stats: {
      totalConversations: 8,
      totalSubmissions: 3,
      avgResponseTime: 2.1,
      satisfactionRate: 92,
      activeRequests: 1
    }
  }
}

/**
 * Get mock submission requests
 */
function getMockSubmissionRequests(): SubmissionRequest[] {
  return [
    {
      id: '1',
      type: 'concern',
      title: 'Pothole on Hilliard Blvd',
      description: 'Large pothole near the intersection causing vehicle damage',
      status: 'in_review',
      progress: 50,
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      caseNumber: 'WL-2024-001',
      department: 'Public Works',
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'permit',
      title: 'Deck Addition Permit',
      description: 'Building permit for 12x16 deck addition to residential property',
      status: 'approved',
      progress: 75,
      submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      caseNumber: 'WL-2024-002',
      department: 'Building Department',
      estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      type: 'form',
      title: 'Business License Application',
      description: 'New business license for consulting services',
      status: 'completed',
      progress: 100,
      submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      caseNumber: 'WL-2024-003',
      department: 'City Clerk',
      estimatedCompletion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}

/**
 * Get status color for UI display
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'submitted': return 'bg-blue-100 text-blue-800'
    case 'in_review': return 'bg-yellow-100 text-yellow-800'
    case 'approved': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    case 'completed': return 'bg-green-100 text-green-800'
    case 'active': return 'bg-blue-100 text-blue-800'
    case 'error': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get type icon for submission requests
 */
export function getTypeIcon(type: string): string {
  switch (type) {
    case 'permit': return '🏗️'
    case 'concern': return '⚠️'
    case 'form': return '📄'
    case 'payment': return '💳'
    default: return '📋'
  }
}