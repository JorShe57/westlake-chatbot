"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  MessageSquare, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  LogOut,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "@/components/ui/menu"
import { config } from "@/lib/config"
import { useAuth } from "@/contexts/AuthContext"

interface AdminStats {
  totalConversations: number
  activeSessions: number
  totalMessages: number
  averageResponseTime: number
  satisfactionRate: number
  errorRate: number
}

interface RecentConversation {
  id: string
  sessionId: string
  startTime: string
  lastMessage: string
  messageCount: number
  status: "active" | "completed" | "error"
  userAgent: string
}

export default function AdminPortal() {
  const router = useRouter()
  const { user, userProfile, loading, signIn, signOut, isAdmin, isAuthenticated, error, clearError } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [stats, setStats] = useState<AdminStats>({
    totalConversations: 0,
    activeSessions: 0,
    totalMessages: 0,
    averageResponseTime: 0,
    satisfactionRate: 0,
    errorRate: 0
  })
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([])

  // Handle login with authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn(username, password)
      loadMockData()
    } catch (error: any) {
      // Error is handled by the context
    }
  }

  const loadMockData = () => {
    setStats({
      totalConversations: 1247,
      activeSessions: 8,
      totalMessages: 8923,
      averageResponseTime: 2.3,
      satisfactionRate: 94.2,
      errorRate: 2.1
    })

    setRecentConversations([
      {
        id: "1",
        sessionId: "abc123",
        startTime: "2024-01-15T10:30:00Z",
        lastMessage: "How do I apply for a building permit?",
        messageCount: 12,
        status: "completed",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
      },
      {
        id: "2",
        sessionId: "def456",
        startTime: "2024-01-15T11:15:00Z",
        lastMessage: "What are the hours for City Hall?",
        messageCount: 6,
        status: "active",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      {
        id: "3",
        sessionId: "ghi789",
        startTime: "2024-01-15T09:45:00Z",
        lastMessage: "Error: Unable to process request",
        messageCount: 3,
        status: "error",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
      }
    ])
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setUsername("")
      setPassword("")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect non-admin users to chat
  if (isAuthenticated && !isAdmin) {
    router.push("/chat")
    return null
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#2d5016]">
              Westlake Admin Portal
            </CardTitle>
            <CardDescription>
              Sign in to manage the chatbot
            </CardDescription>
          </CardHeader>
                           <CardContent>
                   <form onSubmit={handleLogin} className="space-y-4">
                     {error && (
                       <Alert variant="destructive">
                         <AlertDescription>{error}</AlertDescription>
                       </Alert>
                     )}
                     <div>
                       <Input
                         type="text"
                         placeholder="Username"
                         value={username}
                         onChange={(e) => setUsername(e.target.value)}
                         className="w-full"
                       />
                     </div>
                     <div>
                       <Input
                         type="password"
                         placeholder="Password"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="w-full"
                       />
                     </div>
                     <Button type="submit" className="w-full bg-[#2d5016] hover:bg-[#223d11]">
                       Sign In
                     </Button>
                   </form>
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Don't have an account? <Link href="/auth/signup" className="text-[#2d5016] hover:underline">Sign up</Link></p>
              <p className="mt-2">Or use demo credentials:</p>
              <div className="mt-2 space-y-1 text-xs">
                <div><strong>Admin:</strong> admin@westlake.org / Admin123!</div>
                <div><strong>User:</strong> user@westlake.org / User123!</div>
                <div><strong>Legacy:</strong> admin / westlake2024</div>
              </div>
            </div>
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
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-[#2d5016]">
                Westlake Chatbot Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                System Online
              </Badge>
              <Button variant="ghost" onClick={handleLogout} className="text-gray-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="conversations" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Conversations</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalConversations.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently online
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.satisfactionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageResponseTime}s</div>
                  <p className="text-xs text-muted-foreground">
                    -0.3s from last week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>
                  Latest chatbot interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentConversations.map((conversation) => (
                    <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {conversation.sessionId.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{conversation.lastMessage}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(conversation.startTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            conversation.status === "active" ? "default" :
                            conversation.status === "completed" ? "secondary" : "destructive"
                          }
                        >
                          {conversation.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {conversation.messageCount} messages
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Conversations</CardTitle>
                    <CardDescription>
                      View and manage chatbot conversations
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search conversations..."
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentConversations.map((conversation) => (
                    <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {conversation.sessionId.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{conversation.lastMessage}</p>
                          <p className="text-sm text-gray-500">
                            Session: {conversation.sessionId} • {conversation.messageCount} messages
                          </p>
                          <p className="text-xs text-gray-400">
                            {conversation.userAgent}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            conversation.status === "active" ? "default" :
                            conversation.status === "completed" ? "secondary" : "destructive"
                          }
                        >
                          {conversation.status}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/admin/conversation/${conversation.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Detailed performance metrics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Performance Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Messages</span>
                        <span className="font-medium">{stats.totalMessages.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Rate</span>
                        <span className="font-medium text-red-600">{stats.errorRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Session Duration</span>
                        <span className="font-medium">4.2 minutes</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Popular Topics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Building Permits</span>
                        <span className="font-medium">23%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trash & Recycling</span>
                        <span className="font-medium">18%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water Bills</span>
                        <span className="font-medium">15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage admin users and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Admin User</p>
                        <p className="text-sm text-gray-500">admin@westlake.org</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Administrator</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chatbot Configuration</CardTitle>
                <CardDescription>
                  Configure chatbot settings and integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">n8n Integration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Webhook URL</label>
                        <Input 
                          value={config.n8n.webhookUrl}
                          className="w-full"
                          readOnly
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Connection active</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Welcome Message</label>
                        <Input 
                          defaultValue={config.chatbot.welcomeMessage}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                        <Input 
                          type="number"
                          defaultValue="30"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button className="bg-[#2d5016] hover:bg-[#223d11]">
                      Save Settings
                    </Button>
                    <Button variant="outline">
                      Test Connection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 