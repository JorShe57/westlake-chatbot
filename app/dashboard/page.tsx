"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import { 
  MessageSquare, 
  User,
  Settings,
  LogOut,
  ArrowRight,
  Clock,
  Calendar,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Star,
  Activity,
  Loader2,
  BarChart3,
  History,
  ClipboardList
} from "lucide-react"
import { config } from "@/lib/config"
import { 
  getUserDashboardData, 
  UserDashboardData, 
  ConversationSummary, 
  SubmissionRequest,
  getStatusColor,
  getTypeIcon
} from "@/lib/dashboard-data"
import { useRealtimeData } from "@/lib/realtime-data"

export default function UserDashboard() {
  const { user, userProfile, isAuthenticated, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected')
  const realtime = useRealtimeData()

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push("/auth/signin")
      return
    }

    // Redirect admins to admin portal
    if (isAdmin) {
      router.push("/admin")
      return
    }

    // Load dashboard data
    if (user?.id) {
      loadDashboardData()
    }
  }, [isAuthenticated, isAdmin, router, user?.id])

  const loadDashboardData = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      const data = await getUserDashboardData(user.id)
      setDashboardData(data)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    await loadDashboardData()
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (isAdmin) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#2d5016] to-[#1a2f0a] rounded-lg flex items-center justify-center shadow-md">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#2d5016]">
                  Dashboard
                </h1>
                <p className="text-xs text-gray-500">City of Westlake Services</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshData}
                disabled={isLoading}
                className="text-gray-600 hover:text-[#2d5016]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Badge variant="outline" className="border-green-200 text-green-700">
                <User className="w-3 h-3 mr-1" />
                {userProfile?.email || user?.email}
              </Badge>
              <Button variant="ghost" onClick={handleSignOut} className="text-gray-600 hover:text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back!
              </h2>
              <p className="text-gray-600">
                Your personalized dashboard for Westlake city services.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
              {dashboardData && (
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Activity className="w-3 h-3 mr-1" />
                    {dashboardData.stats.activeRequests} Active
                  </Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Star className="w-3 h-3 mr-1" />
                    {dashboardData.stats.satisfactionRate}% Satisfaction
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {dashboardData && !isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversations</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalConversations}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalSubmissions}</p>
                  </div>
                  <ClipboardList className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.avgResponseTime}s</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.satisfactionRate}%</p>
                  </div>
                  <Star className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Chat History</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center space-x-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <Link href="/chat">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6 text-[#2d5016]" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#2d5016] transition-colors" />
                    </div>
                    <CardTitle className="group-hover:text-[#2d5016] transition-colors">Start New Chat</CardTitle>
                    <CardDescription>
                      Get instant answers about city services and information
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <Link href="https://egov.cityofwestlake.org" target="_blank">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <CardTitle className="group-hover:text-blue-600 transition-colors">Online Payments</CardTitle>
                    <CardDescription>
                      Pay your bills and access city services online
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <Link href="https://www.cityofwestlake.org/forms/report-a-concern" target="_blank">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <CardTitle className="group-hover:text-orange-600 transition-colors">Report Issues</CardTitle>
                    <CardDescription>
                      Report problems or concerns to the city
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </div>
          </TabsContent>

          {/* Chat History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <History className="w-5 h-5" />
                      <span>Chat History</span>
                    </CardTitle>
                    <CardDescription>
                      Your recent conversations with the Westlake assistant
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : dashboardData?.recentConversations.length ? (
                  <div className="space-y-4">
                    {dashboardData.recentConversations.map((conversation) => (
                      <div key={conversation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex space-x-4">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-[#2d5016] text-white">
                                {conversation.topic?.charAt(0) || 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900">{conversation.topic}</h4>
                                <Badge className={getStatusColor(conversation.status)} variant="secondary">
                                  {conversation.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {conversation.lastMessage}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(conversation.startTime).toLocaleDateString()}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <MessageSquare className="w-3 h-3" />
                                  <span>{conversation.messageCount} messages</span>
                                </span>
                                {conversation.satisfaction && (
                                  <span className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 fill-current text-yellow-400" />
                                    <span>{conversation.satisfaction}%</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Link href={`/chat?session=${conversation.sessionId}`}>
                            <Button variant="ghost" size="sm" className="text-[#2d5016] hover:text-[#223d11]">
                              <span>Continue</span>
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">No conversations yet</p>
                    <p className="text-sm">Start chatting to see your conversation history</p>
                    <Button className="mt-4 bg-[#2d5016] hover:bg-[#223d11]">
                      <Link href="/chat" className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Start First Chat</span>
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submission Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <ClipboardList className="w-5 h-5" />
                      <span>Submission Requests</span>
                    </CardTitle>
                    <CardDescription>
                      Track your permits, forms, and service requests
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : dashboardData?.submissionRequests.length ? (
                  <div className="space-y-6">
                    {dashboardData.submissionRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="text-2xl">{getTypeIcon(request.type)}</div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">{request.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                {request.caseNumber && (
                                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                    {request.caseNumber}
                                  </span>
                                )}
                                {request.department && (
                                  <span className="flex items-center space-x-1">
                                    <Settings className="w-3 h-3" />
                                    <span>{request.department}</span>
                                  </span>
                                )}
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Submitted {new Date(request.submittedAt).toLocaleDateString()}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(request.status)} variant="secondary">
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Progress</span>
                            <span className="text-gray-600">{request.progress}%</span>
                          </div>
                          <Progress value={request.progress} className="h-2" />
                          
                          {request.estimatedCompletion && request.status !== 'completed' && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>
                                Estimated completion: {new Date(request.estimatedCompletion).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">No submission requests</p>
                    <p className="text-sm">Your permits and service requests will appear here</p>
                    <Button className="mt-4 bg-[#2d5016] hover:bg-[#223d11]">
                      <Link href="https://www.cityofwestlake.org/forms/report-a-concern" target="_blank" className="flex items-center space-x-2">
                        <ExternalLink className="w-4 h-4" />
                        <span>Submit Request</span>
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>City Hall Information</CardTitle>
                  <CardDescription>
                    Contact information and hours of operation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Hours</p>
                      <p className="text-sm text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{config.city.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-gray-600">{config.city.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                  <CardDescription>
                    Popular city services and resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {config.quickActions.slice(0, 4).map((action, index) => (
                      <a
                        key={index}
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors group"
                      >
                        <span className="font-medium group-hover:text-[#2d5016] transition-colors">{action.name}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#2d5016] transition-colors" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 