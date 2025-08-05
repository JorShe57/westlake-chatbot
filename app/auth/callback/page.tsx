"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have a code in the URL
        const code = searchParams.get('code')
        
        if (!code) {
          setStatus('error')
          setMessage("No authentication code found in the URL.")
          return
        }

        if (!supabase) {
          setStatus('error')
          setMessage("Supabase is not configured.")
          return
        }

        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error("Error exchanging code for session:", error)
          setStatus('error')
          setMessage(error.message)
          return
        }

        // Success! The user is now signed in
        setStatus('success')
        setMessage("Email verified successfully! You are now signed in.")
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } catch (error: any) {
        console.error("Error in auth callback:", error)
        setStatus('error')
        setMessage(error.message || "An unexpected error occurred.")
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {status === 'loading' && (
                <>
                  <Loader2 className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
                  <h2 className="text-2xl font-bold text-[#2d5016] mb-2">Verifying Your Email</h2>
                  <p className="text-gray-600 mb-4">
                    Please wait while we verify your email address...
                  </p>
                </>
              )}
              
              {status === 'success' && (
                <>
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-[#2d5016] mb-2">Email Verified!</h2>
                  <p className="text-gray-600 mb-4">
                    {message}
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Redirecting you to your dashboard...
                  </p>
                  <Button 
                    onClick={() => router.push("/dashboard")} 
                    className="w-full bg-[#2d5016] hover:bg-[#223d11]"
                  >
                    Go to Dashboard
                  </Button>
                </>
              )}
              
              {status === 'error' && (
                <>
                  <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
                  <p className="text-gray-600 mb-4">
                    {message}
                  </p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => router.push("/auth/signin")} 
                      className="w-full bg-[#2d5016] hover:bg-[#223d11]"
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push("/")} 
                      className="w-full"
                    >
                      Return to Home
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}