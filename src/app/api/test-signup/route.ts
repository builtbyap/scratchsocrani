import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { email, password, userData } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required'
      }, { status: 400 })
    }
    
    console.log('🧪 Testing sign-up process for:', email)
    console.log('📝 User data:', userData)
    
    // Test the sign-up process (only email and password)
    const result = await supabase.auth.signUp({
      email,
      password
    })
    
    if (result.error) {
      console.error('❌ Sign-up test failed:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error.message || 'Sign-up failed',
        details: result.error
      }, { status: 400 })
    }
    
    console.log('✅ Sign-up test successful:', result.data)
    
    // If user was created, verify the profile in users table
    if (result.data?.user) {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', result.data.user.id)
        .single()
      
      if (profileError) {
        console.error('❌ Error verifying user profile:', profileError)
        return NextResponse.json({
          success: false,
          message: 'User created but profile verification failed',
          user: result.data.user,
          profileError
        }, { status: 500 })
      }
      
      console.log('✅ User profile verified:', userProfile)
      
      return NextResponse.json({
        success: true,
        message: 'Sign-up and profile creation successful',
        user: {
          id: result.data.user.id,
          email: result.data.user.email,
          email_confirmed_at: result.data.user.email_confirmed_at
        },
        profile: {
          id: userProfile.id,
          email: userProfile.email,
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          subscription_status: userProfile.subscription_status,
          created_at: userProfile.created_at
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sign-up initiated (email confirmation required)',
      data: result.data
    })
    
  } catch (error) {
    console.error('❌ Error in sign-up test:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 