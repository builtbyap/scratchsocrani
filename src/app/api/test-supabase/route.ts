import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function GET() {
  try {
    // Test environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🔍 Testing Supabase credentials:')
    console.log('URL:', supabaseUrl)
    console.log('Key exists:', !!supabaseAnonKey)
    console.log('Key starts with:', supabaseAnonKey?.substring(0, 20) + '...')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: 'Missing Supabase credentials',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      }, { status: 500 })
    }
    
    // Test the existing Supabase client
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase query error:', error)
      return NextResponse.json({
        error: 'Supabase query failed',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }
    
    console.log('✅ Supabase connection successful')
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      keyPrefix: supabaseAnonKey?.substring(0, 20) + '...'
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 