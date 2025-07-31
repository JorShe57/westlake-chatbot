// Configuration for the Westlake Chatbot
import { Video, AlertTriangle, CreditCard, FileText, MessageCircle } from "lucide-react"

export const config = {
  // n8n Integration
  n8n: {
    webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 
      "https://jordenshevel.app.n8n.cloud/webhook/4cb4880c-4d16-443b-b562-c680729b5d1d/chat"
  },

  // Admin Portal (legacy fallback)
  admin: {
    username: process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin",
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "westlake2024"
  },

  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  },

  // Chatbot Settings
  chatbot: {
    welcomeMessage: process.env.NEXT_PUBLIC_WELCOME_MESSAGE || 
      "Hello! I'm the City of Westlake virtual assistant. How can I help you today? Feel free to ask about city services, department information, permits, or general questions.",
    sessionTimeout: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || "30") * 60 * 1000, // Convert to milliseconds
    maxMessageLength: 1000,
    rateLimit: {
      maxRequests: 10,
      windowMs: 60000 // 1 minute
    }
  },

  // City Information
  city: {
    name: "City of Westlake",
    phone: process.env.NEXT_PUBLIC_CITY_HALL_PHONE || "(440) 871-3300",
    address: process.env.NEXT_PUBLIC_CITY_HALL_ADDRESS || "27700 Hilliard Blvd, Westlake, OH 44145",
    website: "https://www.cityofwestlake.org",
    email: "info@cityofwestlake.org"
  },

  // Quick Actions
  quickActions: [
    {
      name: "Meeting Webcasts",
      icon: Video,
      href: "https://mediasite.cityofwestlake.org/Mediasite/Channel/webcasts/browse/null/most-recent/null/0/null",
    },
    { 
      name: "Report a Concern", 
      icon: AlertTriangle, 
      href: "https://www.cityofwestlake.org/forms/report-a-concern" 
    },
    { 
      name: "Online Payments", 
      icon: CreditCard, 
      href: "https://egov.cityofwestlake.org/entity/login_main.aspx" 
    },
    { 
      name: "City Documents", 
      icon: FileText, 
      href: "https://onbase.cityofwestlake.org/PublicAccess/index.html" 
    },
    {
      name: "Mayor's Newsletter",
      icon: MessageCircle,
      href: "https://core-docs.s3.us-east-1.amazonaws.com/documents/asset/uploaded_file/5437/CW/5319947/Newsletter_May_-_July_AUG.pdf",
    },
  ],

  // Popular Topics
  popularTopics: [
    {
      name: "Building Permits",
      href: "https://www.cityofwestlake.org/o/cw/page/permits-and-contractor-info",
    },
    {
      name: "Trash & Recycling",
      href: "https://www.cityofwestlake.org/o/cw/page/rubbish-recycling",
    },
    { 
      name: "Water Bills", 
      href: "https://www.cityofwestlake.org/o/cw/page/sewer-water" 
    },
    { 
      name: "City Council", 
      href: "https://www.cityofwestlake.org/page/city-council" 
    },
    { 
      name: "Parks & Rec", 
      href: "https://www.cityofwestlake.org/o/rcwl" 
    },
  ],

  // Quick Prompts
  quickPrompts: [
    "What are the hours for City Hall?",
    "How do I apply for a building permit?",
    "When is my trash pickup day?",
    "How do I pay my water bill online?",
    "What's the phone number for the Parks Department?",
    "How do I report a pothole?",
    "When is the next City Council meeting?",
    "What services does the city provide?",
  ],

  // Error Messages
  errors: {
    networkError: "I'm sorry, I'm experiencing technical difficulties. Please try again later or contact City Hall directly at (440) 871-3300.",
    rateLimitExceeded: "You're sending messages too quickly. Please wait a moment before sending another message.",
    sessionExpired: "Your session has expired. Please refresh the page to start a new conversation.",
    invalidInput: "I couldn't understand your message. Please try rephrasing your question."
  }
}

// Helper function to get environment variable with fallback
export function getEnvVar(key: string, fallback: string): string {
  return process.env[key] || fallback
}

// Helper function to validate webhook URL
export function validateWebhookUrl(url: string): boolean {
  try {
    new URL(url)
    return url.startsWith('https://')
  } catch {
    return false
  }
}

// Helper function to format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
} 