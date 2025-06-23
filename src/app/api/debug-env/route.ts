import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    stripe_secret_key_exists: !!process.env.STRIPE_SECRET_KEY,
    stripe_webhook_secret_exists: !!process.env.STRIPE_WEBHOOK_SECRET,
    stripe_publishable_key_exists: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    supabase_url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_anon_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    base_url: process.env.NEXT_PUBLIC_BASE_URL,
    timestamp: new Date().toISOString()
  })
} 