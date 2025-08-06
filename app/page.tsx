"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Phone,
  MapPin,
  Globe,
  Clock
} from "lucide-react"
import { config } from "@/lib/config"
import { useAuth } from "@/contexts/AuthContext"
import { Navigation } from "@/components/navigation"

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Navigation */}
      <Navigation 
        title="Westlake Virtual Assistant" 
        subtitle="Your 24/7 city services companion"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Now Available
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Your City's
                <span className="text-[#2d5016] block">Virtual Assistant</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Get instant answers about city services, permits, schedules, and more. 
                The Westlake Virtual Assistant is here to help you 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/chat">
                  <Button size="lg" className="bg-[#2d5016] hover:bg-[#223d11] text-lg px-8 py-6">
                    Start Chatting
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/signup">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                      Create Account
                    </Button>
                  </Link>
                )}              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="/westlake-city-hall.jpg" 
                  alt="Westlake City Hall" 
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-100 rounded-full opacity-50"></div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#2d5016] rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Know About Westlake
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From building permits to trash pickup schedules, our virtual assistant has all the information you need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-[#2d5016]" />
                </div>
                <CardTitle>24/7 Support</CardTitle>
                <CardDescription>
                  Get answers anytime, day or night. No waiting on hold or office hours.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Instant Answers</CardTitle>
                <CardDescription>
                  Quick responses to common questions about city services and procedures.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your conversations are secure and your privacy is protected.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quick Access to City Services
            </h2>
            <p className="text-xl text-gray-600">
              Direct links to the most popular city services and resources.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.quickActions.map((action, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <a 
                    href={action.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-center group"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-[#2d5016] transition-colors">
                      <MessageSquare className="w-6 h-6 text-[#2d5016] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#2d5016] transition-colors">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Access {action.name.toLowerCase()}
                    </p>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Need More Help?
            </h2>
            <p className="text-xl text-gray-600">
              Contact City Hall directly or visit us in person.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-[#2d5016]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">{config.city.phone}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#2d5016]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-600">{config.city.address}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#2d5016]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hours</h3>
              <p className="text-gray-600">Mon-Fri: 8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2d5016]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of Westlake residents who are already using our virtual assistant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Try the Chat
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-[#2d5016] hover:bg-gray-100 text-lg px-8 py-6">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-[#2d5016] rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold">Westlake Assistant</span>
              </div>
              <p className="text-gray-400">
                Your 24/7 virtual assistant for all things Westlake.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/chat" className="hover:text-white transition-colors">Start Chat</a></li>
                <li><a href="/auth/signin" className="hover:text-white transition-colors">Sign In</a></li>
                <li><a href="/auth/signup" className="hover:text-white transition-colors">Sign Up</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">City Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://www.cityofwestlake.org" className="hover:text-white transition-colors">City Website</a></li>
                <li><a href="https://egov.cityofwestlake.org" className="hover:text-white transition-colors">Online Payments</a></li>
                <li><a href="https://www.cityofwestlake.org/forms/report-a-concern" className="hover:text-white transition-colors">Report Issues</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{config.city.phone}</li>
                <li>{config.city.address}</li>
                <li><a href={`mailto:${config.city.email}`} className="hover:text-white transition-colors">{config.city.email}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 City of Westlake. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
