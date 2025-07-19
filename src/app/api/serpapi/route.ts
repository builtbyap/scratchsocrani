import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { searchQuery } = await request.json()
    
    if (!searchQuery) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    const apiKey = '8e8f53ef8711b4178aca30947abe9f1cd51ac5dafbc4934aa4382ab890c615a0'
    const serpApiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}`
    
    console.log('🔍 Making SerpAPI request from server:', serpApiUrl)
    
    const response = await fetch(serpApiUrl)
    
    if (!response.ok) {
      throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log('🔍 SerpAPI response received:', data)
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ Error in SerpAPI route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SerpAPI data' }, 
      { status: 500 }
    )
  }
} 