# Supabase Setup Guide for Westlake Chatbot

This guide explains how to set up Supabase for the Westlake Chatbot application.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL scripts in the following order:
   - `supabase-schema.sql` - Sets up the main tables (users, conversations, messages)
   - `supabase-feedback-schema.sql` - Sets up the feedback table

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# n8n Integration
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id/chat

# Admin Credentials (Fallback)
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=secure-password

# Chatbot Configuration
NEXT_PUBLIC_WELCOME_MESSAGE="Hello! I'm the City of Westlake virtual assistant. How can I help you today?"
NEXT_PUBLIC_SESSION_TIMEOUT=30

# City Information
NEXT_PUBLIC_CITY_HALL_PHONE=(440) 871-3300
NEXT_PUBLIC_CITY_HALL_ADDRESS=27700 Hilliard Blvd, Westlake, OH 44145
```

Replace `your-supabase-project-url` and `your-supabase-anon-key` with the values from your Supabase project settings.

## Getting Supabase URL and Anon Key

1. Go to your Supabase project dashboard
2. Click on the "Settings" icon (gear icon) in the left sidebar
3. Click on "API" in the settings menu
4. Under "Project URL", copy the URL value to `NEXT_PUBLIC_SUPABASE_URL`
5. Under "Project API keys", copy the "anon public" key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Testing the Connection

Once you've set up the environment variables, restart your development server and the chat functionality should automatically connect to Supabase.

You can verify the connection by:
1. Opening the browser console
2. Checking for any Supabase-related errors
3. Sending a test message in the chat
4. Checking your Supabase database to see if the message was stored

## Data Structure

The Supabase integration uses the following tables:

1. **users** - Stores user information
2. **conversations** - Stores chat conversation metadata
3. **messages** - Stores individual chat messages
4. **feedback** - Stores user feedback on bot responses

## Troubleshooting

If you encounter issues with the Supabase connection:

1. Verify that your environment variables are correctly set
2. Check that the SQL scripts have been executed successfully
3. Ensure your Supabase project is active
4. Check the browser console for any error messages