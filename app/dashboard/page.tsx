"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { 
  MessageSquare, 
  User,
  Settings,
  LogOut,
  ArrowRight,
  Clock,
  Calendar,
  FileText
} from "lucide-react"
import { config } from "@/lib/config"

export default function UserDashboard() {
  const { user, userProfile, isAuthenticated, isAdmin, signOut } = useAuth()
  const router = useRouter()

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
  }, [isAuthenticated, isAdmin, router])

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-[#2d5016] rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-[#2d5016]">
                Westlake User Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <User className="w-3 h-3 mr-1" />
                {userProfile?.email || user?.email}
              </Badge>
              <Button variant="ghost" onClick={handleSignOut} className="text-gray-600">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile?.email || user?.email}!
          </h2>
          <p className="text-gray-600">
            Access your city services and get help from our virtual assistant.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/chat">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-[#2d5016]" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <CardTitle>Start Chat</CardTitle>
                <CardDescription>
                  Get instant answers about city services and information
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="https://egov.cityofwestlake.org" target="_blank">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <CardTitle>Online Payments</CardTitle>
                <CardDescription>
                  Pay your bills and access city services online
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="https://www.cityofwestlake.org/forms/report-a-concern" target="_blank">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-orange-600" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <CardTitle>Report Issues</CardTitle>
                <CardDescription>
                  Report problems or concerns to the city
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* City Information */}
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
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium">{action.name}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent interactions with city services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
              <p className="text-sm">Start chatting to see your conversation history</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 