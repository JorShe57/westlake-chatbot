import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log the incoming request for debugging
    console.log('API Route: Received chat request:', {
      message: body.message,
      sessionId: body.sessionId,
      userId: body.userId
    })

    // Forward the request to the n8n webhook
    const response = await fetch(config.n8n.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'NextJS-API',
      },
      body: JSON.stringify({
        message: body.message,
        sessionId: body.sessionId,
        userId: body.userId || 'anonymous',
        userAgent: body.userAgent || request.headers.get('user-agent'),
        timestamp: body.timestamp || new Date().toISOString(),
        // Add any additional metadata
        clientIP: request.ip || 'unknown',
        referer: request.headers.get('referer')
      }),
    })

    console.log('API Route: n8n webhook response status:', response.status)

    if (!response.ok) {
      console.error('API Route: n8n webhook error:', response.status, response.statusText)
      return NextResponse.json(
        { 
          error: 'Chat service temporarily unavailable',
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('API Route: n8n webhook response:', {
      id: data.id,
      hasResponse: !!data.bot_response,
      responseLength: data.bot_response?.length || 0
    })

    // Return the response from n8n
    return NextResponse.json(data)

  } catch (error) {
    console.error('API Route: Error processing chat request:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error processing chat request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}