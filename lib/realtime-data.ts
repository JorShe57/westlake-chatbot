import { supabase } from './supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

// Real-time data management for live updates
export class RealtimeDataManager {
  private channels: Map<string, RealtimeChannel> = new Map()
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  /**
   * Subscribe to conversation updates
   */
  subscribeToConversations(userId: string, callback: (data: any) => void) {
    const channelKey = `conversations:${userId}`
    
    if (!this.channels.has(channelKey) && supabase) {
      const channel = supabase
        .channel(channelKey)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            this.notifyListeners(channelKey, payload)
          }
        )
        .subscribe()

      this.channels.set(channelKey, channel)
    }

    // Add listener
    if (!this.listeners.has(channelKey)) {
      this.listeners.set(channelKey, new Set())
    }
    this.listeners.get(channelKey)?.add(callback)

    return () => this.unsubscribe(channelKey, callback)
  }

  /**
   * Subscribe to message updates
   */
  subscribeToMessages(conversationId: string, callback: (data: any) => void) {
    const channelKey = `messages:${conversationId}`
    
    if (!this.channels.has(channelKey) && supabase) {
      const channel = supabase
        .channel(channelKey)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            this.notifyListeners(channelKey, payload)
          }
        )
        .subscribe()

      this.channels.set(channelKey, channel)
    }

    // Add listener
    if (!this.listeners.has(channelKey)) {
      this.listeners.set(channelKey, new Set())
    }
    this.listeners.get(channelKey)?.add(callback)

    return () => this.unsubscribe(channelKey, callback)
  }

  /**
   * Subscribe to admin statistics updates
   */
  subscribeToAdminStats(callback: (data: any) => void) {
    const channelKey = 'admin:stats'
    
    if (!this.channels.has(channelKey) && supabase) {
      // Subscribe to multiple tables for comprehensive stats
      const channel = supabase
        .channel(channelKey)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations'
          },
          (payload) => {
            this.notifyListeners(channelKey, { type: 'conversations', payload })
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            this.notifyListeners(channelKey, { type: 'messages', payload })
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'feedback'
          },
          (payload) => {
            this.notifyListeners(channelKey, { type: 'feedback', payload })
          }
        )
        .subscribe()

      this.channels.set(channelKey, channel)
    }

    // Add listener
    if (!this.listeners.has(channelKey)) {
      this.listeners.set(channelKey, new Set())
    }
    this.listeners.get(channelKey)?.add(callback)

    return () => this.unsubscribe(channelKey, callback)
  }

  /**
   * Subscribe to submission request updates
   */
  subscribeToSubmissionRequests(userId: string, callback: (data: any) => void) {
    const channelKey = `submissions:${userId}`
    
    if (!this.channels.has(channelKey) && supabase) {
      const channel = supabase
        .channel(channelKey)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'submission_requests',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            this.notifyListeners(channelKey, payload)
          }
        )
        .subscribe()

      this.channels.set(channelKey, channel)
    }

    // Add listener
    if (!this.listeners.has(channelKey)) {
      this.listeners.set(channelKey, new Set())
    }
    this.listeners.get(channelKey)?.add(callback)

    return () => this.unsubscribe(channelKey, callback)
  }

  /**
   * Notify all listeners for a channel
   */
  private notifyListeners(channelKey: string, data: any) {
    const listeners = this.listeners.get(channelKey)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in realtime listener:', error)
        }
      })
    }
  }

  /**
   * Unsubscribe from a specific channel and callback
   */
  private unsubscribe(channelKey: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(channelKey)
    if (listeners) {
      listeners.delete(callback)
      
      // If no more listeners, unsubscribe from the channel
      if (listeners.size === 0) {
        const channel = this.channels.get(channelKey)
        if (channel && supabase) {
          supabase.removeChannel(channel)
          this.channels.delete(channelKey)
          this.listeners.delete(channelKey)
        }
      }
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll() {
    if (supabase) {
      this.channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
    this.channels.clear()
    this.listeners.clear()
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!supabase) return 'disconnected'
    
    // Check if any channels are connected
    for (const channel of this.channels.values()) {
      if (channel.state === 'joined') {
        return 'connected'
      } else if (channel.state === 'joining') {
        return 'connecting'
      }
    }
    
    return 'disconnected'
  }
}

// Global instance
export const realtimeManager = new RealtimeDataManager()

// React hook for real-time data
export function useRealtimeData() {
  return {
    subscribeToConversations: realtimeManager.subscribeToConversations.bind(realtimeManager),
    subscribeToMessages: realtimeManager.subscribeToMessages.bind(realtimeManager),
    subscribeToAdminStats: realtimeManager.subscribeToAdminStats.bind(realtimeManager),
    subscribeToSubmissionRequests: realtimeManager.subscribeToSubmissionRequests.bind(realtimeManager),
    getConnectionStatus: realtimeManager.getConnectionStatus.bind(realtimeManager),
    unsubscribeAll: realtimeManager.unsubscribeAll.bind(realtimeManager)
  }
}

// Utility function to simulate real-time updates for demo mode
export function simulateRealtimeUpdate(type: 'conversation' | 'message' | 'submission', data: any) {
  // This would be used in demo mode to simulate real-time updates
  setTimeout(() => {
    console.log(`Simulated ${type} update:`, data)
  }, Math.random() * 1000 + 500)
}