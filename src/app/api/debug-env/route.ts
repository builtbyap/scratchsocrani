import { NextResponse } from 'next/server'

export async function GET() {
  const envCheck = {
    stripe: {
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) || 'not set',
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'not set',
      webhookSecretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 7) || 'not set',
    },
    supabase: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
      anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || 'not set',
    },
    app: {
      hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'not set',
    },
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(envCheck)
} 