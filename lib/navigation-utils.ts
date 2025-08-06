/**
 * Navigation utilities for the Westlake Chatbot application
 */

export interface AppRoute {
  path: string
  name: string
  description: string
  requiresAuth: boolean
  requiresAdmin: boolean
  icon?: string
}

export const APP_ROUTES: AppRoute[] = [
  {
    path: "/",
    name: "Home",
    description: "Landing page with city information and features",
    requiresAuth: false,
    requiresAdmin: false,
    icon: "Home"
  },
  {
    path: "/chat",
    name: "Chat",
    description: "Interactive chat with Westlake Virtual Assistant",
    requiresAuth: false,
    requiresAdmin: false,
    icon: "MessageSquare"
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    description: "User dashboard with chat history and submission tracking",
    requiresAuth: true,
    requiresAdmin: false,
    icon: "LayoutDashboard"
  },
  {
    path: "/admin",
    name: "Admin Portal",
    description: "Administrative interface for chatbot management",
    requiresAuth: true,
    requiresAdmin: true,
    icon: "Shield"
  },
  {
    path: "/admin/conversation/[id]",
    name: "Conversation Details",
    description: "Detailed view of specific conversation",
    requiresAuth: true,
    requiresAdmin: true,
    icon: "MessageSquare"
  },
  {
    path: "/auth/signin",
    name: "Sign In",
    description: "User authentication page",
    requiresAuth: false,
    requiresAdmin: false,
    icon: "LogIn"
  },
  {
    path: "/auth/signup",
    name: "Sign Up",
    description: "User registration page",
    requiresAuth: false,
    requiresAdmin: false,
    icon: "UserPlus"
  }
]

/**
 * Get the route configuration for a given path
 */
export function getRouteConfig(path: string): AppRoute | undefined {
  return APP_ROUTES.find(route => {
    if (route.path.includes('[id]')) {
      const routePattern = route.path.replace('[id]', '\\w+')
      const regex = new RegExp(`^${routePattern}$`)
      return regex.test(path)
    }
    return route.path === path
  })
}

/**
 * Check if user can access a route
 */
export function canAccessRoute(
  path: string, 
  isAuthenticated: boolean, 
  isAdmin: boolean
): boolean {
  const route = getRouteConfig(path)
  if (!route) return false

  if (route.requiresAuth && !isAuthenticated) return false
  if (route.requiresAdmin && !isAdmin) return false

  return true
}

/**
 * Get available routes for current user
 */
export function getAvailableRoutes(
  isAuthenticated: boolean, 
  isAdmin: boolean
): AppRoute[] {
  return APP_ROUTES.filter(route => 
    canAccessRoute(route.path, isAuthenticated, isAdmin)
  )
}

/**
 * Generate breadcrumb items for a path
 */
export function generateBreadcrumbs(path: string): Array<{label: string, href?: string}> {
  const segments = path.split('/').filter(Boolean)
  const breadcrumbs: Array<{label: string, href?: string}> = []

  // Always start with Home
  if (path !== '/') {
    breadcrumbs.push({ label: 'Home', href: '/' })
  }

  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const route = getRouteConfig(currentPath)
    
    if (route) {
      breadcrumbs.push({
        label: route.name,
        href: index === segments.length - 1 ? undefined : currentPath
      })
    } else {
      // Handle dynamic segments
      const label = segment.length > 8 ? segment.slice(0, 8) + '...' : segment
      breadcrumbs.push({
        label,
        href: index === segments.length - 1 ? undefined : currentPath
      })
    }
  })

  return breadcrumbs
}

/**
 * Get redirect path for authenticated user
 */
export function getAuthenticatedRedirect(isAdmin: boolean): string {
  return isAdmin ? '/admin' : '/dashboard'
}

/**
 * Get default route for unauthenticated user
 */
export function getUnauthenticatedRedirect(): string {
  return '/auth/signin'
}

/**
 * Navigation state management
 */
export class NavigationManager {
  private static instance: NavigationManager
  private listeners: Set<(path: string) => void> = new Set()

  static getInstance(): NavigationManager {
    if (!NavigationManager.instance) {
      NavigationManager.instance = new NavigationManager()
    }
    return NavigationManager.instance
  }

  subscribe(callback: (path: string) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  navigate(path: string): void {
    this.listeners.forEach(callback => callback(path))
  }
}

/**
 * Format conversation session ID for display
 */
export function formatSessionId(sessionId: string): string {
  if (sessionId.length <= 8) return sessionId
  return sessionId.slice(0, 4) + '...' + sessionId.slice(-4)
}

/**
 * Generate conversation URL
 */
export function getConversationUrl(sessionId: string): string {
  return `/chat?session=${encodeURIComponent(sessionId)}`
}

/**
 * Generate admin conversation URL
 */
export function getAdminConversationUrl(conversationId: string): string {
  return `/admin/conversation/${encodeURIComponent(conversationId)}`
}