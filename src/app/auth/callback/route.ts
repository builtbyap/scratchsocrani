import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase environment variables not set" }, { status: 500 })
  }

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Redirect to the main app page (where layout.tsx will check subscription)
      return NextResponse.redirect(new URL("https://socrani.com/", request.url))
    }
  }

  // Return the user to an error page or the login page if there's no code or an error
  return NextResponse.redirect(new URL("/login", request.url))
}
