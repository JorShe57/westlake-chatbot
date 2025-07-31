import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if both URL and key are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types
export interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
  last_login?: string
  is_active: boolean
}

export interface Conversation {
  id: string
  session_id: string
  user_id?: string
  start_time: string
  end_time?: string
  status: 'active' | 'completed' | 'error'
  message_count: number
  user_agent: string
  ip_address: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  is_user: boolean
  content: string
  formatted?: boolean
  message_data?: any
  timestamp: string
  created_at: string
}

// Authentication helpers
export const auth = {
  // Sign up with email and password
  async signUp(email: string, password: string, role: 'admin' | 'user' = 'user') {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    // Create user profile in our custom table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          role,
          is_active: true
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
      }
    }

    return { data, error }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Update last login
    if (data.user) {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id)
    }

    return { data, error }
  },

  // Sign out
  async signOut() {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error }
  },

  // Get current user
  async getCurrentUser() {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get user profile
  async getUserProfile(userId: string) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // Check if user is admin
  async isAdmin(userId: string) {
    const profile = await this.getUserProfile(userId)
    return profile.role === 'admin'
  }
}

// Conversation helpers
export const conversations = {
  // Create new conversation
  async create(sessionId: string, userAgent: string, ipAddress: string, userId?: string) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        session_id: sessionId,
        user_id: userId,
        user_agent: userAgent,
        ip_address: ipAddress,
        status: 'active',
        message_count: 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get conversation by session ID
  async getBySessionId(sessionId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error) throw error
    return data
  },

  // Update conversation
  async update(id: string, updates: Partial<Conversation>) {
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all conversations (for admin)
  async getAll(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  },

  // Get conversations by user
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}

// Message helpers
export const messages = {
  // Add message to conversation
  async add(conversationId: string, message: Omit<Message, 'id' | 'conversation_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        ...message
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get messages for conversation
  async getByConversation(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true })

    if (error) throw error
    return data
  }
}

// Admin helpers
export const admin = {
  // Get all users
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Update user role
  async updateUserRole(userId: string, role: 'admin' | 'user') {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get conversation statistics
  async getStats() {
    const { data, error } = await supabase
      .from('conversations')
      .select('status, created_at')

    if (error) throw error

    const total = data.length
    const active = data.filter(c => c.status === 'active').length
    const completed = data.filter(c => c.status === 'completed').length
    const errors = data.filter(c => c.status === 'error').length

    // Get recent conversations (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recent = data.filter(c => new Date(c.created_at) > weekAgo).length

    return {
      total,
      active,
      completed,
      errors,
      recent
    }
  }
} 