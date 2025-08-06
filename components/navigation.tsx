"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { NotificationSystem, useNotifications } from "@/components/notification-system"
import {
  MessageSquare,
  LayoutDashboard,
  Settings,
  User,
  LogOut,
  Menu,
  Home,
  Shield,
  Bell,
  ChevronLeft,
  ExternalLink
} from "lucide-react"

interface NavigationProps {
  showBackButton?: boolean
  backButtonLabel?: string
  backButtonHref?: string
  title?: string
  subtitle?: string
  className?: string
}

export function Navigation({ 
  showBackButton = false, 
  backButtonLabel = "Back", 
  backButtonHref,
  title,
  subtitle,
  className = ""
}: NavigationProps) {
  const { user, userProfile, isAuthenticated, isAdmin, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const { notifications, addNotification, markAsRead, dismiss, clearAll } = useNotifications()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const handleBack = () => {
    if (backButtonHref) {
      router.push(backButtonHref)
    } else {
      router.back()
    }
  }

  const navigationItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      show: true
    },
    {
      name: "Chat",
      href: "/chat",
      icon: MessageSquare,
      show: true
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: isAuthenticated && !isAdmin
    },
    {
      name: "Admin Portal",
      href: "/admin",
      icon: Shield,
      show: isAuthenticated && isAdmin
    }
  ]

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2d5016] to-[#1a2f0a] rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span>Westlake</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 space-y-4">
          {navigationItems.filter(item => item.show).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === item.href
                  ? "bg-[#2d5016] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
          <div className="border-t pt-4 mt-4">
            <div className="space-y-2">
              <a
                href="https://www.cityofwestlake.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ExternalLink className="w-5 h-5" />
                <span>City Website</span>
              </a>
              <a
                href="https://egov.cityofwestlake.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Online Payments</span>
              </a>
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback className="bg-[#2d5016] text-white">
              {userProfile?.email?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userProfile?.email || user?.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {isAdmin ? "Administrator" : "User"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Portal</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/chat" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Chat</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="text-gray-600 hover:text-[#2d5016]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {backButtonLabel}
              </Button>
            )}
            
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#2d5016] to-[#1a2f0a] rounded-lg flex items-center justify-center shadow-md">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-[#2d5016]">
                  {title || "Westlake Assistant"}
                </h1>
                {subtitle && (
                  <p className="text-xs text-gray-500">{subtitle}</p>
                )}
              </div>
            </Link>
          </div>

          {/* Center - Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.filter(item => item.show).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-[#2d5016] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <Badge variant="outline" className="hidden sm:flex border-green-200 text-green-700 bg-green-50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs">Online</span>
            </Badge>

            {/* Notifications */}
            {isAuthenticated && (
              <NotificationSystem
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onDismiss={dismiss}
                onClearAll={clearAll}
              />
            )}

            {/* Mobile Menu */}
            <MobileMenu />

            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-[#2d5016] hover:bg-[#223d11]">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// Breadcrumb component for deeper navigation
interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-500 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <span>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-[#2d5016] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}