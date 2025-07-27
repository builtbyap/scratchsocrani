import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { supabase } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Socrani - Undetectable AI Assistant",
  description: "Your undetectable AI desktop assistant with voice input, file analysis, and smart responses.",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const pathname = headersList.get("x-pathname") || ""

  // Create a server-side Supabase client for session checking
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session and not on login/callback page, redirect to login
  if (!session && !pathname.includes("/login") && !pathname.includes("/auth/callback")) {
    redirect("/login")
  }

  // If session exists, check subscription status
  if (session) {
    const { data: userProfile, error } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", session.user.id)
      .single()

    if (error) {
      console.error("Error fetching user subscription status:", error)
      // Redirect to login or an error page if profile fetch fails
      if (!pathname.includes("/login") && !pathname.includes("/auth/callback")) {
        redirect("/login")
      }
    }

    // If subscription is not active and not already on the subscription required page, redirect
    if (userProfile?.subscription_status !== "active" && !pathname.includes("/subscription-required")) {
      redirect("https://socrani.com/pricing")
    }
  }

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
