"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Chrome } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in and has an active subscription
    // This check is also done in layout.tsx, but a quick client-side check
    // can prevent unnecessary redirects if the session is already valid.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("subscription_status")
          .eq("id", session.user.id)
          .single()

        if (!profileError && userProfile?.subscription_status === "active") {
          router.push("/")
        } else if (!profileError && userProfile?.subscription_status !== "active") {
          router.push("/subscription-required")
        }
      }
    })

    // Listen for auth state changes (e.g., after redirect from OAuth)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // After successful login, check subscription status before redirecting to main app
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("subscription_status")
          .eq("id", session.user.id)
          .single()

        if (!profileError && userProfile?.subscription_status === "active") {
          router.push("/")
        } else {
          router.push("/subscription-required")
        }
      }
    })

    return () => {
      authListener?.unsubscribe()
    }
  }, [router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `https://socrani.com/auth/callback`, // Ensure this matches your Supabase redirect URL
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        throw error
      }

      // If data.url exists, it means it's a redirect to the OAuth provider
      if (data.url) {
        // In Electron, this will open in the default browser.
        // The callback will then redirect back to the app.
        console.log("Redirecting to Google for authentication:", data.url)
      }
    } catch (err: any) {
      console.error("Error signing in with Google:", err.message)
      setError(err.message || "Failed to sign in with Google.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-gray-800 text-white border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Welcome to Socrani
          </CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to access your undetectable AI desktop assistant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
            Sign in with Google
          </Button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
