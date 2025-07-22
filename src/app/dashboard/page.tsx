'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SubscriptionGuard from '@/components/SubscriptionGuard'
import { getSupabaseClient } from '@/lib/supabase-client'
import ChatModal from '@/components/ChatModal'
import LinkedInChatModal from '@/components/LinkedInChatModal'
import { 
  Sparkles, 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Bell,
  Search,
  Plus,
  Settings,
  LogOut,
  User,
  Folder,
  MessageSquare,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Crown,
  Mail,
  MailOpen,
  MailCheck,
  Trash2,
  Edit,
  Eye,
  Linkedin,
  Share2,
  Target,
  Users2,
  Building2,
  Globe,
  Zap,
  Save
} from 'lucide-react'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [emails, setEmails] = useState<any[]>([])
  const [loadingEmails, setLoadingEmails] = useState(false)
  const [deletingEmails, setDeletingEmails] = useState<Set<number>>(new Set())
  const [recentlyViewedEmails, setRecentlyViewedEmails] = useState<any[]>([])
  const [savedEmails, setSavedEmails] = useState<any[]>([])
  const [emailSearchTerm, setEmailSearchTerm] = useState('')
  const [linkedInConnections, setLinkedInConnections] = useState<any[]>([])
  const [loadingLinkedIn, setLoadingLinkedIn] = useState(false)
  const [deletingLinkedIn, setDeletingLinkedIn] = useState<Set<number>>(new Set())
  const [addingEmail, setAddingEmail] = useState(false)
  const [recentlyViewedLinkedIn, setRecentlyViewedLinkedIn] = useState<any[]>([])
  const [savedLinkedIn, setSavedLinkedIn] = useState<any[]>([])
  const [linkedInSearchTerm, setLinkedInSearchTerm] = useState('')
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [isLinkedInChatModalOpen, setIsLinkedInChatModalOpen] = useState(false)
  const [sessionRestored, setSessionRestored] = useState(false)
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  // Fetch emails from Supabase for the current user
  const fetchEmails = async (retryCount = 0) => {
    if (!user) {
      console.log('❌ No user found, skipping email fetch')
      setLoadingEmails(false)
      return
    }
    
    // Only show loading if we don't have any emails data
    if (emails.length === 0) {
      setLoadingEmails(true)
    }
    
    console.log(`🔍 Fetching emails (attempt ${retryCount + 1})...`)
    try {
      const supabase = getSupabaseClient()
      console.log('🔍 Fetching emails for user:', user.id)
      console.log('🔍 User object:', user)
      
      // Try multiple approaches to fetch emails
      let emailsData = null
      let error = null
      
      // Approach 1: Try the standard emails table
      console.log('🔍 Approach 1: Trying emails table...')
      const { data: emailsResult, error: emailsError } = await supabase
        .from('emails')
        .select('*')
        .eq('user_id', user.id)
      
      if (!emailsError && emailsResult && emailsResult.length > 0) {
        console.log('✅ Success with emails table:', emailsResult)
        emailsData = emailsResult
      } else {
        console.log('❌ Emails table failed:', emailsError?.message || 'No data found')
        
        // Approach 2: Try without user_id filter (in case RLS is handling it)
        console.log('🔍 Approach 2: Trying emails table without user_id filter...')
        const { data: allEmails, error: allEmailsError } = await supabase
          .from('emails')
          .select('*')
        
        if (!allEmailsError && allEmails && allEmails.length > 0) {
          console.log('✅ Found emails without user filter:', allEmails)
          emailsData = allEmails
        } else {
          console.log('❌ No emails found without user filter:', allEmailsError?.message || 'No data')
          
          // Approach 3: Try different table names
          const tableNames = ['email', 'email_list', 'contacts', 'email_contacts']
          for (const tableName of tableNames) {
            console.log(`🔍 Approach 3: Trying table ${tableName}...`)
            const { data: altResult, error: altError } = await supabase
              .from(tableName)
              .select('*')
              .eq('user_id', user.id)
            
            if (!altError && altResult && altResult.length > 0) {
              console.log(`✅ Success with ${tableName} table:`, altResult)
              emailsData = altResult
              break
            } else {
              console.log(`❌ ${tableName} table failed:`, altError?.message || 'No data')
            }
          }
        }
      }
      
      if (emailsData) {
        console.log('✅ Final emails data:', emailsData)
        console.log('✅ Number of emails:', emailsData.length)
        console.log('✅ Email data sample:', emailsData[0])
        setEmails(emailsData)
        // Cache the real data in localStorage
        if (user) {
          localStorage.setItem(`emails_${user.id}`, JSON.stringify(emailsData))
          console.log('✅ Cached real emails data')
        }
      } else {
        console.log('❌ No emails found in database')
        console.log('❌ Please add real data to your emails table')
        setEmails([])
        // Clear any cached demo data
        if (user) {
          localStorage.removeItem(`emails_${user.id}`)
          console.log('✅ Cleared cached demo data')
        }
      }
      
    } catch (error) {
      console.error('❌ Unexpected error fetching emails:', error)
      
      // Retry logic for network issues
      if (retryCount < 2) {
        console.log(`🔄 Retrying email fetch in 2 seconds... (attempt ${retryCount + 1})`)
        setTimeout(() => {
          fetchEmails(retryCount + 1)
        }, 2000)
        return
      }
      
      setEmails([])
    } finally {
      setLoadingEmails(false)
    }
  }

  // Fetch LinkedIn connections from Supabase for the current user
  const fetchLinkedInConnections = async (retryCount = 0) => {
    if (!user) {
      console.log('❌ No user found, skipping LinkedIn fetch')
      setLoadingLinkedIn(false)
      return
    }
    
    // Only show loading if we don't have any LinkedIn data
    if (linkedInConnections.length === 0) {
      setLoadingLinkedIn(true)
    }
    
    console.log(`🔍 Fetching LinkedIn connections (attempt ${retryCount + 1})...`)
    try {
      const supabase = getSupabaseClient()
      console.log('🔍 Fetching LinkedIn connections for user:', user.id)
      console.log('🔍 User object:', user)
      
      // Try to fetch LinkedIn connections from the Linkedin table
      console.log('🔍 Fetching from Linkedin table for user:', user.id)
      
      let linkedInData = null
      
      // First, try without user_id filter since RLS should handle it
      console.log('🔍 Trying without user_id filter (RLS should handle it)...')
      const { data: linkedinResult, error: linkedinError } = await supabase
        .from('Linkedin')
        .select('*')
      
      if (!linkedinError && linkedinResult && linkedinResult.length > 0) {
        console.log('✅ Success with Linkedin table (RLS handled):', linkedinResult)
        console.log('✅ Number of records found:', linkedinResult.length)
        console.log('✅ First record sample:', linkedinResult[0])
        linkedInData = linkedinResult
      } else {
        console.log('❌ Linkedin table failed (RLS approach):', linkedinError?.message || 'No data found')
        if (linkedinError) {
          console.log('❌ Error details:', {
            message: linkedinError.message,
            details: linkedinError.details,
            hint: linkedinError.hint,
            code: linkedinError.code
          })
        }
        console.log('❌ Result data:', linkedinResult)
        console.log('❌ Result length:', linkedinResult?.length || 0)
        
        // Try with explicit user_id filter as fallback
        console.log('🔍 Trying with explicit user_id filter...')
        const { data: userLinkedin, error: userLinkedinError } = await supabase
          .from('Linkedin')
          .select('*')
          .eq('user_id', user.id)
        
        if (!userLinkedinError && userLinkedin && userLinkedin.length > 0) {
          console.log('✅ Success with explicit user filter:', userLinkedin)
          console.log('✅ Number of records found:', userLinkedin.length)
          linkedInData = userLinkedin
        } else {
          console.log('❌ Explicit user filter failed:', userLinkedinError?.message || 'No data')
          if (userLinkedinError) {
            console.log('❌ Error details:', {
              message: userLinkedinError.message,
              details: userLinkedinError.details,
              hint: userLinkedinError.hint,
              code: userLinkedinError.code
            })
          }
        }
      }
      
      if (linkedInData) {
        console.log('✅ Final LinkedIn connections data:', linkedInData)
        console.log('✅ Number of LinkedIn connections:', linkedInData.length)
        console.log('✅ LinkedIn data sample:', linkedInData[0])
        setLinkedInConnections(linkedInData)
        // Cache the real data in localStorage
        if (user) {
          localStorage.setItem(`linkedin_${user.id}`, JSON.stringify(linkedInData))
          console.log('✅ Cached real LinkedIn data')
        }
      } else {
        console.log('❌ No LinkedIn connections found in database')
        console.log('❌ Please add real data to your LinkedIn table')
        setLinkedInConnections([])
        // Clear any cached demo data
        if (user) {
          localStorage.removeItem(`linkedin_${user.id}`)
          console.log('✅ Cleared cached demo data')
        }
      }
      
    } catch (error) {
      console.error('❌ Unexpected error fetching LinkedIn connections:', error)
      
      // Retry logic for network issues
      if (retryCount < 2) {
        console.log(`🔄 Retrying LinkedIn fetch in 2 seconds... (attempt ${retryCount + 1})`)
        setTimeout(() => {
          fetchLinkedInConnections(retryCount + 1)
        }, 2000)
        return
      }
      
      setLinkedInConnections([])
    } finally {
      setLoadingLinkedIn(false)
    }
  }

  // Debug function to check available tables
  const debugTables = async () => {
    try {
      const supabase = getSupabaseClient()
      console.log('🔍 Checking available tables...')
      
      // Try to check specific tables we're looking for
      const tablesToCheck = ['emails', 'Linkedin']
      for (const tableName of tablesToCheck) {
        try {
          const { data: tableData, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
          
          if (tableError) {
            console.log(`❌ Table ${tableName}: ${tableError.message}`)
            console.log(`❌ Error details for ${tableName}:`, {
              message: tableError.message,
              details: tableError.details,
              hint: tableError.hint,
              code: tableError.code
            })
          } else {
            console.log(`✅ Table ${tableName}: exists and accessible`)
            console.log(`✅ Sample data from ${tableName}:`, tableData)
          }
        } catch (e) {
          console.log(`❌ Table ${tableName}: ${e}`)
        }
      }
      
      // Table accessibility check completed
      console.log('✅ All table accessibility checks completed')
    } catch (error) {
      console.log('❌ Error checking tables:', error)
    }
  }

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  // Handle OAuth callback and session restoration
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session after OAuth:', error)
          return
        }
        
        if (session) {
          console.log('✅ OAuth callback successful, session found:', session.user.email)
        }
      } catch (error) {
        console.error('❌ Error handling OAuth callback:', error)
      }
    }
    
    // Check if this is an OAuth callback (URL contains auth parameters)
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      console.log('🔍 OAuth callback detected, handling...')
      handleOAuthCallback()
    }
  }, [])

  // Update useEffect to fetch data only when user is available
  useEffect(() => {
    if (user) {
      console.log('🔍 User authenticated, starting data fetch...')
      console.log('🔍 User ID:', user.id)
      console.log('🔍 User email:', user.email)
      
      // Fetch data with retry logic
      const fetchData = async () => {
        try {
          await Promise.all([
            fetchEmails(),
            fetchLinkedInConnections()
          ])
          
          // Mark session as restored
          setSessionRestored(true)
          console.log('✅ Session restored successfully')
        } catch (error) {
          console.error('❌ Error fetching data:', error)
          // Retry once after a delay
          setTimeout(() => {
            fetchEmails(1)
            fetchLinkedInConnections(1)
          }, 2000)
        }
      }
      
      fetchData()
    } else if (!loading) {
      console.log('❌ No user found and not loading, redirecting to signin...')
      router.push('/signin')
    }
  }, [user, loading, router])

  // Handle visibility change to refresh data when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && !loading) {
        console.log('🔄 Tab became visible, checking data...')
        // Only refresh if we have no data (don't clear cache, just check if we need to fetch)
        if (emails.length === 0 || linkedInConnections.length === 0) {
          fetchEmails()
          fetchLinkedInConnections()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, loading, emails.length, linkedInConnections.length])

  // Handle page focus to refresh data when returning to tab
  useEffect(() => {
    const handleFocus = () => {
      if (user && !loading) {
        console.log('🔄 Page focused, checking data freshness...')
        // Only refresh if we have no data
        if (emails.length === 0 || linkedInConnections.length === 0) {
          fetchEmails()
          fetchLinkedInConnections()
        }
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [user, loading, emails.length, linkedInConnections.length])

  // Handle tab close to clear cache
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        console.log('🧹 Tab closing, clearing cache...')
        localStorage.removeItem(`emails_${user.id}`)
        localStorage.removeItem(`linkedin_${user.id}`)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && user) {
        console.log('🧹 Tab hidden, clearing cache...')
        localStorage.removeItem(`emails_${user.id}`)
        localStorage.removeItem(`linkedin_${user.id}`)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user])

  // Show session restored notification
  useEffect(() => {
    if (sessionRestored && user) {
      // Show a brief success message
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      notification.textContent = '✅ Session restored successfully!'
      document.body.appendChild(notification)
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 3000)
    }
  }, [sessionRestored, user])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we restore your session</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Redirecting to sign in...</p>
          <p className="text-gray-400 text-sm mt-2">Please sign in to access your dashboard</p>
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    
    try {
      const { error } = await signOut()
      if (error) {
        console.error('Error signing out:', error)
      } else {
        // Clear all local state data
        setEmails([])
        setLinkedInConnections([])
        setRecentlyViewedEmails([])
        setSavedEmails([])
        setRecentlyViewedLinkedIn([])
        setSavedLinkedIn([])
        setEmailSearchTerm('')
        setLinkedInSearchTerm('')
        
        // Clear cached data from localStorage
        if (user) {
          localStorage.removeItem(`emails_${user.id}`)
          localStorage.removeItem(`linkedin_${user.id}`)
        }
        
        // Redirect to sign in page after successful sign out
        router.push('/signin')
      }
    } catch (err) {
      console.error('Error signing out:', err)
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleManageAccount = () => {
    console.log('🔍 Redirecting to Stripe billing portal...')
    const billingUrl = 'https://billing.stripe.com/p/login/cNi8wO7lk9426MD07veUU00'
    console.log('✅ Redirecting to:', billingUrl)
    
    // Open in new tab/window
    window.open(billingUrl, '_blank', 'noopener,noreferrer')
  }

  const handleAddEmail = () => {
    setIsChatModalOpen(true)
  }

  const handleLinkedInChatComplete = async (linkedInData: any) => {
    console.log('🚀 handleLinkedInChatComplete called!')
    alert('LinkedIn chat complete function called!')
    
    if (!user) return
    
    try {
      console.log('🔗 Processing LinkedIn data from chat:', linkedInData)
      console.log('🔗 Full linkedInData object:', JSON.stringify(linkedInData, null, 2))
      
      // Process the data
      const company = linkedInData.company
      const position = linkedInData.position
      const searchResults = linkedInData.searchResults
      const profiles = linkedInData.profiles
      
      console.log('🔗 Processed LinkedIn data:', { company, position, searchResults, profiles })
      console.log('🔗 Search results type:', typeof searchResults)
      console.log('🔗 Profiles type:', typeof profiles)
      console.log('🔗 Search results keys:', searchResults ? Object.keys(searchResults) : 'null')
      console.log('🔗 Profiles length:', profiles ? profiles.length : 'null')
      
      const supabase = getSupabaseClient()
      
      // Only save real LinkedIn profile data, not basic connection cards
      console.log('🔍 Checking for real LinkedIn profile data...')
      
      // Always save search data to Linkedin table, regardless of results
      console.log('💾 Saving LinkedIn search data to database...')
      
      let dataToInsert = []
      
      if (profiles && profiles.length > 0) {
        console.log('🔍 Filtered LinkedIn profiles found:', profiles.length)
        profiles.slice(0, 5).forEach((profile: any, index: number) => {
          console.log(`🔗 Profile ${index + 1}:`, {
            name: profile.name,
            linkedin_url: profile.linkedin_url
          })
        })
        
        // Save filtered profiles
        dataToInsert = profiles.map((profile: any) => ({
          user_id: user.id,
          name: `${profile.name} - ${position}`,
          company: company,
          linkedin: profile.linkedin_url
        }))
      } else if (searchResults && searchResults.organic_results && searchResults.organic_results.length > 0) {
        console.log('🔍 No filtered profiles found, saving raw search results:', searchResults.organic_results.length)
        
        // Save raw search results if no filtered profiles
        dataToInsert = searchResults.organic_results.slice(0, 10).map((result: any) => ({
          user_id: user.id,
          name: `${result.title.replace(" | LinkedIn", "")} - ${position}`,
          company: company,
          linkedin: result.link || null
        }))
      } else {
        console.log('🔍 No search results found, saving search attempt record')
        
        // Save a record of the search attempt
        dataToInsert = [{
          user_id: user.id,
          name: `${position} - ${company} (Search Attempt)`,
          company: company,
          linkedin: null
        }]
      }
      
      console.log('💾 Data to insert:', dataToInsert)
      console.log('📊 Data structure being sent to Linkedin table:')
      dataToInsert.forEach((item: any, index: number) => {
        console.log(`📊 Item ${index + 1}:`, {
          user_id: item.user_id,
          name: item.name,
          company: item.company,
          linkedin: item.linkedin
        })
      })
      
      console.log('🔍 About to insert into Supabase Linkedin table...')
      console.log('🔍 User ID for insertion:', user.id)
      console.log('🔍 Number of items to insert:', dataToInsert.length)
      
      const { data: insertData, error: insertError } = await supabase
        .from('Linkedin')
        .insert(dataToInsert)
        .select()
      
      if (insertError) {
        console.error('❌ Error adding LinkedIn data:', insertError)
        console.error('❌ Error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        })
        console.error('❌ Data being inserted:', dataToInsert)
      } else {
        console.log('✅ LinkedIn data added successfully:', insertData)
        
        // Update local state with new data
        if (insertData && insertData.length > 0) {
          setLinkedInConnections(prev => {
            const updatedConnections = [...insertData, ...prev]
            console.log('🔗 Updated LinkedIn connections list:', updatedConnections.length, 'connections')
            return updatedConnections
          })
          
          // Update cached data
          if (user) {
            const currentCached = localStorage.getItem(`linkedin_${user.id}`)
            const cachedConnections = currentCached ? JSON.parse(currentCached) : []
            const updatedCached = [...insertData, ...cachedConnections]
            localStorage.setItem(`linkedin_${user.id}`, JSON.stringify(updatedCached))
            console.log('✅ Updated cached LinkedIn data')
          }
        }
      }
      
      // Note: No basic connection data to add to local state since we only save real profiles
      
      // Also refresh from database to ensure consistency
      console.log('🔄 Refreshing LinkedIn connections from database...')
      await fetchLinkedInConnections()
      
      // Show success message
      if (profiles && profiles.length > 0) {
        alert(`Found and saved ${profiles.length} filtered LinkedIn profiles for ${position} at ${company}!`)
      } else if (searchResults && searchResults.organic_results && searchResults.organic_results.length > 0) {
        alert(`Saved ${Math.min(searchResults.organic_results.length, 10)} raw search results for ${position} at ${company}!`)
      } else {
        alert(`Search completed for ${position} at ${company}. Search attempt recorded in database.`)
      }
      
    } catch (error) {
      console.error('❌ Unexpected error adding LinkedIn connection:', error)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  const handleChatComplete = async (emailData: any) => {
    if (!user) return
    
    setAddingEmail(true)
    try {
      console.log('📧 Processing email data from chat:', emailData)
      
      // Process the data according to the specified logic
      const first_name = emailData.firstName
      const last_name = emailData.lastName
      const company = emailData.company
      const domain = emailData.domain
      
      console.log('📧 Processed data:', { first_name, last_name, company, domain })
      
      // Make Hunter.io API request
      const apiKey = '5681619d1c0433d78656ae319f6b376e4adbc279'
      const hunterUrl = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(first_name)}&last_name=${encodeURIComponent(last_name)}&api_key=${apiKey}`
      
      console.log('🔍 Making Hunter.io API request:', hunterUrl)
      
      const hunterResponse = await fetch(hunterUrl)
      const hunterData = await hunterResponse.json()
      
      console.log('🔍 Hunter.io API response:', hunterData)
      
      // Use the specified logic to handle the API response
      const email = hunterData.data ? hunterData.data.email : null
      let finalEmail = `${first_name.toLowerCase()}.${last_name.toLowerCase()}@${domain}`
      let emailSource = 'generated'
      
      if (email) {
        finalEmail = email
        emailSource = 'hunter.io'
        console.log('✅ Found email via Hunter.io:', finalEmail)
      } else {
        console.log('⚠️ No email found via Hunter.io, using generated email')
      }
      
      const supabase = getSupabaseClient()
      
      // Prepare the data for insertion - only use columns that definitely exist
      const supabaseEmailData = {
        user_id: user.id,
        name: `${first_name} ${last_name}`,
        company: company,
        email: finalEmail
      }
      
      // Log Hunter.io data for debugging (but don't save to database)
      if (emailSource === 'hunter.io' && hunterData.data) {
        console.log('🔍 Hunter.io additional data (not saved to DB):', {
          score: hunterData.data.score,
          sources: hunterData.data.sources,
          verification: hunterData.data.verification,
          department: hunterData.data.department,
          seniority: hunterData.data.seniority,
          linkedin: hunterData.data.linkedin,
          twitter: hunterData.data.twitter,
          phone_number: hunterData.data.phone_number,
          confidence: hunterData.data.confidence
        })
      }
      
      console.log('💾 Saving email data to Supabase:', supabaseEmailData)
      console.log('🔍 User ID:', user.id)
      console.log('🔍 User authenticated:', !!user)
      
      // Validate data before insertion
      if (!user.id) {
        console.error('❌ No user ID available')
        alert('User not authenticated. Please sign in again.')
        return
      }
      
      if (!supabaseEmailData.name || !supabaseEmailData.email || !supabaseEmailData.company) {
        console.error('❌ Missing required data:', supabaseEmailData)
        alert('Missing required email data. Please try again.')
        return
      }
      
      const { data, error } = await supabase
        .from('emails')
        .insert(supabaseEmailData)
        .select()
      
      if (error) {
        console.error('❌ Error adding email:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        alert(`Failed to add email: ${error.message}`)
        return
      }
      
      console.log('✅ Email added successfully:', data)
      
      // Immediately add the new email to the local state for instant display
      if (data && data[0]) {
        const newEmail = data[0]
        console.log('📧 Adding new email to local state:', newEmail)
        setEmails(prev => {
          // Add the new email at the beginning of the list
          const updatedEmails = [newEmail, ...prev]
          console.log('📧 Updated emails list:', updatedEmails.length, 'emails')
          return updatedEmails
        })
        
        // Update cached data
        if (user) {
          const currentCached = localStorage.getItem(`emails_${user.id}`)
          const cachedEmails = currentCached ? JSON.parse(currentCached) : []
          const updatedCached = [newEmail, ...cachedEmails]
          localStorage.setItem(`emails_${user.id}`, JSON.stringify(updatedCached))
          console.log('✅ Updated cached emails data')
        }
      }
      
      // Also refresh from database to ensure consistency
      console.log('🔄 Refreshing emails from database...')
      await fetchEmails()
      
      // Show success message
      const sourceText = emailSource === 'hunter.io' ? 'found via email finder' : 'generated'
      alert(`Email for ${first_name} ${last_name} at ${company} has been added successfully! (${sourceText})`)
      
    } catch (error) {
      console.error('❌ Unexpected error adding email:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setAddingEmail(false)
    }
  }

  const handleAddLinkedIn = () => {
    setIsLinkedInChatModalOpen(true)
  }

  const handleViewEmail = (email: any) => {
    // Add to recently viewed emails (limit to 5 most recent)
    setRecentlyViewedEmails(prev => {
      const filtered = prev.filter(e => e.id !== email.id) // Remove if already exists
      return [email, ...filtered].slice(0, 5) // Keep only 5 most recent
    })
    
    // Here you could also open a detailed view modal or navigate to email details
    console.log('👁️ Viewing email:', email)
  }

  // Delete email from Supabase and local state
  const handleDeleteEmail = async (email: any) => {
    if (!user) return
    
    // Show confirmation dialog
    if (!confirm(`Are you sure you want to delete "${email.name || email.email}"?`)) {
      return
    }
    
    setDeletingEmails(prev => new Set(prev).add(email.id))
    try {
      const supabase = getSupabaseClient()
      console.log('🗑️ Deleting email:', email.id, 'for user:', user.id)
      
      const { error } = await supabase
        .from('emails')
        .delete()
        .eq('id', email.id)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('❌ Error deleting email:', error)
        alert('Failed to delete email. Please try again.')
        return
      }
      
      console.log('✅ Email deleted successfully')
      const updatedEmails = emails.filter(e => e.id !== email.id)
      setEmails(updatedEmails)
      setRecentlyViewedEmails(prev => prev.filter(e => e.id !== email.id))
      setSavedEmails(prev => prev.filter(e => e.id !== email.id))
      
      // Update cached data
      if (user) {
        localStorage.setItem(`emails_${user.id}`, JSON.stringify(updatedEmails))
      }
      
      // Show success message
      console.log('✅ Email removed from dashboard')
    } catch (error) {
      console.error('❌ Unexpected error deleting email:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setDeletingEmails(prev => {
        const newSet = new Set(prev)
        newSet.delete(email.id)
        return newSet
      })
    }
  }

  const handleSendEmail = (email: any) => {
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email.email)}`
    
    console.log('📧 Opening Gmail compose for:', email.email)
    window.open(gmailComposeUrl, '_blank')
  }

  const handleSaveEmail = (email: any) => {
    console.log('💾 Saving email:', email)
    
    // Add to saved emails (limit to 10 most recent)
    setSavedEmails(prev => {
      const filtered = prev.filter(e => e.id !== email.id) // Remove if already exists
      return [email, ...filtered].slice(0, 10) // Keep only 10 most recent
    })
    
    alert(`Email "${email.name}" from ${email.company} has been saved!`)
  }

  const handleViewLinkedIn = (connection: any) => {
    // Add to recently viewed LinkedIn connections (limit to 5 most recent)
    setRecentlyViewedLinkedIn(prev => {
      const filtered = prev.filter(c => c.id !== connection.id) // Remove if already exists
      return [connection, ...filtered].slice(0, 5) // Keep only 5 most recent
    })
    
    console.log('👁️ Viewing LinkedIn connection:', connection)
  }

  // Delete LinkedIn connection from Supabase and local state
  const handleDeleteLinkedIn = async (connection: any) => {
    if (!user) return
    
    // Show confirmation dialog
    if (!confirm(`Are you sure you want to delete "${connection.name || 'this connection'}"?`)) {
      return
    }
    
    setDeletingLinkedIn(prev => new Set(prev).add(connection.id))
    try {
      const supabase = getSupabaseClient()
      console.log('🗑️ Deleting LinkedIn connection:', connection.id, 'for user:', user.id)
      
      const { error } = await supabase
        .from('Linkedin')
        .delete()
        .eq('id', connection.id)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('❌ Error deleting LinkedIn connection:', error)
        alert('Failed to delete LinkedIn connection. Please try again.')
        return
      }
      
      console.log('✅ LinkedIn connection deleted successfully')
      const updatedLinkedIn = linkedInConnections.filter(c => c.id !== connection.id)
      setLinkedInConnections(updatedLinkedIn)
      setRecentlyViewedLinkedIn(prev => prev.filter(c => c.id !== connection.id))
      setSavedLinkedIn(prev => prev.filter(c => c.id !== connection.id))
      
      // Update cached data
      if (user) {
        localStorage.setItem(`linkedin_${user.id}`, JSON.stringify(updatedLinkedIn))
      }
      
      // Show success message
      console.log('✅ LinkedIn connection removed from dashboard')
    } catch (error) {
      console.error('❌ Unexpected error deleting LinkedIn connection:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setDeletingLinkedIn(prev => {
        const newSet = new Set(prev)
        newSet.delete(connection.id)
        return newSet
      })
    }
  }

  const handleSaveLinkedIn = (connection: any) => {
    console.log('💾 Saving LinkedIn connection:', connection)
    
    // Add to saved LinkedIn connections (limit to 10 most recent)
    setSavedLinkedIn(prev => {
      const filtered = prev.filter(c => c.id !== connection.id) // Remove if already exists
      return [connection, ...filtered].slice(0, 10) // Keep only 10 most recent
    })
    
    alert(`LinkedIn connection "${connection.name}" from ${connection.company} has been saved!`)
  }

  const handleOpenLinkedIn = (connection: any) => {
    console.log('🔍 Connection object:', connection)
    console.log('🔍 Available properties:', Object.keys(connection))
    
    // Try different possible column names
    const linkedinUrl = connection.linkedin_url || connection.linkedin || connection.linkedinUrl || connection.url
    
    if (linkedinUrl) {
      console.log('🔗 Opening LinkedIn profile:', linkedinUrl)
      window.open(linkedinUrl, '_blank', 'noopener,noreferrer')
    } else {
      console.log('❌ No LinkedIn URL found for connection:', connection)
      console.log('❌ Available properties:', Object.keys(connection))
      alert('No LinkedIn URL available for this connection.')
    }
  }

  // Deduplicate LinkedIn connections by data content (name, company, linkedin)
  const uniqueLinkedInConnections = Array.from(
    new Map(linkedInConnections.map(conn => [
      `${conn.name}-${conn.company}-${conn.linkedin}`, 
      conn
    ])).values()
  )

  // Filter LinkedIn connections based on search term (company name) only and remove invalid entries
  const filteredLinkedInConnections = uniqueLinkedInConnections.filter((connection: any) => {
    // Skip connections with null/empty values or placeholder text
    const hasValidName = connection.name && connection.name.trim() !== '' && !connection.name.includes('No name')
    const hasValidCompany = connection.company && connection.company.trim() !== '' && !connection.company.includes('No company')
    
    // Skip test data entries - comprehensive filtering
    const isTestUser = connection.name && (
      connection.name.toLowerCase().includes('test user') ||
      connection.name.toLowerCase().includes('test@example.com') ||
      connection.name === 'Test User'
    )
    const isTestCompany = connection.company && (
      connection.company.toLowerCase().includes('test company') ||
      connection.company.toLowerCase().includes('example.com') ||
      connection.company === 'Test Company'
    )
    
    // Only show connections with valid data
    if (!hasValidName || !hasValidCompany || isTestUser || isTestCompany) {
      if (isTestUser || isTestCompany) {
        console.log('🚫 Filtering out LinkedIn test data:', { name: connection.name, company: connection.company })
      }
      return false
    }
    
    // If there's a search term, check if it matches the company name
    if (linkedInSearchTerm.trim()) {
      return connection.company?.toLowerCase().includes(linkedInSearchTerm.toLowerCase())
    }
    
    // If no search term, show all valid connections
    return true
  })
  
  console.log('🔗 Total LinkedIn connections:', linkedInConnections.length)
  console.log('🔗 Unique LinkedIn connections:', uniqueLinkedInConnections.length)
  console.log('🔗 Filtered LinkedIn connections:', filteredLinkedInConnections.length)
  


  // Deduplicate emails by email address only (show all except exact email duplicates)
  const uniqueEmails = Array.from(
    new Map(emails.map(email => [
      email.email?.toLowerCase() || '', 
      email
    ])).values()
  )

  // Filter emails based on search term (company name) only and remove test data
  const filteredEmails = uniqueEmails.filter((email: any) => {
    // Skip test data entries - comprehensive filtering
    const isTestUser = email.name && (
      email.name.toLowerCase().includes('test user') ||
      email.name.toLowerCase().includes('test@example.com') ||
      email.name.toLowerCase().includes('test user') ||
      email.name.toLowerCase().includes('test@example.com') ||
      email.name === 'Test User'
    )
    const isTestCompany = email.company && (
      email.company.toLowerCase().includes('test company') ||
      email.company.toLowerCase().includes('example.com') ||
      email.company === 'Test Company'
    )
    const isTestEmail = email.email && (
      email.email.toLowerCase().includes('test@example.com') ||
      email.email.toLowerCase().includes('test.com')
    )
    
    if (isTestUser || isTestCompany || isTestEmail) {
      console.log('🚫 Filtering out test data:', { 
        name: email.name, 
        company: email.company, 
        email: email.email 
      })
      return false
    }
    
    // If there's a search term, check if it matches the company name
    if (emailSearchTerm.trim()) {
      return email.company?.toLowerCase().includes(emailSearchTerm.toLowerCase())
    }
    
    // If no search term, show all valid emails
    return true
  })
  
  console.log('📧 Total emails:', emails.length)
  console.log('📧 Unique emails:', uniqueEmails.length)
  console.log('📧 Filtered emails:', filteredEmails.length)
  




  const recentCampaigns = [
    {
      id: 1,
      name: 'Weekly Newsletter #45',
      sentDate: '2024-02-01',
      recipients: 1247,
      openRate: 68.5,
      clickRate: 12.3,
      status: 'Sent'
    },
    {
      id: 2,
      name: 'Product Launch Announcement',
      sentDate: '2024-01-28',
      recipients: 1247,
      openRate: 72.1,
      clickRate: 18.7,
      status: 'Sent'
    },
    {
      id: 3,
      name: 'Holiday Special Offer',
      sentDate: '2024-01-25',
      recipients: 1247,
      openRate: 65.3,
      clickRate: 14.2,
      status: 'Sent'
    }
  ]

  const linkedInPosts = [
    {
      id: 1,
      title: 'The Future of AI in Product Development',
      content: 'Excited to share insights on how AI is transforming product development...',
      publishedDate: '2024-02-01',
      likes: 45,
      comments: 12,
      shares: 8,
      views: 1200,
      status: 'Published',
      tags: ['AI', 'Product Development', 'Innovation']
    },
    {
      id: 2,
      title: 'Building Strong Professional Relationships',
      content: 'Networking isn\'t just about collecting business cards...',
      publishedDate: '2024-01-28',
      likes: 32,
      comments: 8,
      shares: 5,
      views: 850,
      status: 'Published',
      tags: ['Networking', 'Professional Growth']
    },
    {
      id: 3,
      title: 'Draft: Industry Trends 2024',
      content: 'Here are the key trends I\'ve observed in our industry...',
      publishedDate: null,
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      status: 'Draft',
      tags: ['Industry Trends', 'Analysis']
    }
  ]



const recentProjects = [
  {
    id: 1,
    name: 'E-commerce Platform',
    client: 'TechCorp Inc.',
    status: 'In Progress',
    progress: 75,
    dueDate: '2024-02-15',
    priority: 'high'
  },
  {
    id: 2,
    name: 'Mobile App Redesign',
    client: 'StartupXYZ',
    status: 'Review',
    progress: 90,
    dueDate: '2024-02-10',
    priority: 'medium'
  },
  {
    id: 3,
    name: 'Cloud Migration',
    client: 'Enterprise Solutions',
    status: 'Planning',
    progress: 25,
    dueDate: '2024-03-01',
    priority: 'low'
  }
]

const recentActivity = [
  {
    id: 1,
    type: 'project',
    message: 'E-commerce Platform - Phase 2 completed',
    time: '2 hours ago',
    icon: CheckCircle
  },
  {
    id: 2,
    type: 'client',
    message: 'New client onboarding - TechCorp Inc.',
    time: '4 hours ago',
    icon: Users
  },
  {
    id: 3,
    type: 'task',
    message: 'Mobile app testing completed',
    time: '6 hours ago',
    icon: Activity
  },
  {
    id: 4,
    type: 'meeting',
    message: 'Client meeting scheduled for tomorrow',
    time: '1 day ago',
    icon: Calendar
  }
]

const upcomingTasks = [
  {
    id: 1,
    title: 'Review mobile app designs',
    dueDate: 'Today',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Client presentation prep',
    dueDate: 'Tomorrow',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Code review for e-commerce',
    dueDate: 'Feb 12',
    priority: 'low'
  }
]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-400/10'
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'low':
        return 'text-green-400 bg-green-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'text-blue-400 bg-blue-400/10'
      case 'Review':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'Planning':
        return 'text-purple-400 bg-purple-400/10'
      case 'Completed':
        return 'text-green-400 bg-green-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="relative z-10 flex">
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-64 bg-dark-800/50 backdrop-blur-md border-r border-white/10 min-h-screen p-6"
          >
            {/* Logo */}
            <div className="flex items-center space-x-2 text-xl font-bold mb-8">
              <Sparkles className="w-6 h-6 text-primary-400" />
              <span className="gradient-text">Socrani</span>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('email-list')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'email-list'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Mail className="w-5 h-5" />
                <span>Email List</span>
              </button>
              <button
                onClick={() => setActiveTab('linkedin')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'linkedin'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </button>
            </nav>

            {/* Bottom Actions */}
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <button 
                onClick={handleManageAccount}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <CreditCard className="w-5 h-5" />
                <span>Manage Account</span>
              </button>
              <button 
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1 p-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400">Welcome back! Here's what's happening today.</p>
              </div>
            </motion.div>

            {/* Content based on active tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >


                {/* Email List and LinkedIn Connections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Email List */}
                    <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                      className="glass-effect rounded-2xl p-6"
                    >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Email List</h2>
                      <button 
                        onClick={() => setActiveTab('email-list')}
                        className="text-primary-400 hover:text-primary-300 text-sm"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {loadingEmails ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-3 text-gray-400">Loading emails...</span>
                        </div>
                      ) : emails.length === 0 ? (
                        <div className="text-center p-8">
                          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">No emails found</p>
                          <p className="text-gray-500 text-sm">Add your first email to get started</p>
                        </div>
                      ) : (
                        emails.slice(0, 5).map((email: any) => (
                          <div key={email.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-primary-400" />
                                </div>
                        <div>
                                  <h3 className="text-white font-medium">{email.name || 'No name'}</h3>
                                  <p className="text-gray-400 text-sm">{email.company || 'No company'}</p>
                        </div>
                        </div>
                      </div>
                          <div className="text-right">
                              <span className="px-2 py-1 rounded-full text-xs text-green-400 bg-green-400/10">
                                Active
                            </span>
                      </div>
                </div>
                        ))
                      )}
                          </div>
                  </motion.div>

                  {/* LinkedIn Connections */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">LinkedIn Connections</h2>
                      <button 
                        onClick={() => setActiveTab('linkedin')}
                        className="text-primary-400 hover:text-primary-300 text-sm"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {loadingLinkedIn ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-3 text-gray-400">Loading connections...</span>
                        </div>
                      ) : uniqueLinkedInConnections.length === 0 ? (
                        <div className="text-center p-8">
                          <Users2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">No connections found</p>
                          <p className="text-gray-500 text-sm">Add your first connection to get started</p>
                        </div>
                      ) : (
                        uniqueLinkedInConnections.slice(0, 5).map((connection) => (
                          <div key={connection.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-primary-400" />
                                </div>
                                <div>
                                  <h3 className="text-white font-medium">{connection.name || 'No name'}</h3>
                                </div>
                              </div>
                          </div>
                          <div className="text-right">
                              <span className="px-2 py-1 rounded-full text-xs text-green-400 bg-green-400/10">
                                Active
                            </span>
                              </div>
                            </div>
                        ))
                      )}
                          </div>
                  </motion.div>
                        </div>
              </motion.div>
            )}

            {/* Email List Tab */}
            {activeTab === 'email-list' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >


                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={handleAddEmail}
                      className="flex items-center justify-center space-x-3 p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <Plus className="w-6 h-6 text-primary-400" />
                      <span className="text-white text-lg font-medium">Add Email</span>
                    </button>
                    </div>
                  </motion.div>

                {/* Email List */}
                  <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  className="glass-effect rounded-2xl p-6 w-full"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Email List</h2>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search by company..."
                            value={emailSearchTerm}
                            onChange={(e) => setEmailSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors text-sm w-48"
                          />
                        </div>
                    </div>
                          </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                    {addingEmail && (
                      <div className="flex items-center justify-center p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
                        <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-primary-400 text-sm">Adding email to database...</span>
                      </div>
                    )}
                      {loadingEmails && emails.length === 0 ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-3 text-gray-400">Loading emails...</span>
                        </div>
                      ) : filteredEmails.length === 0 ? (
                        <div className="text-center p-8">
                          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">
                            {emailSearchTerm.trim() ? 'No emails found' : 'Add your first email to get started'}
                          </p>
                          <p className="text-gray-500 text-sm mt-2">
                            <span className="font-bold">Use the Add Email button</span>
                          </p>
                        </div>
                      ) : (
                        filteredEmails.map((email: any) => (
                          <div key={email.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-primary-400" />
                          </div>
                                <div>
                                  <h3 className="text-white font-medium">{email.name || 'No name'}</h3>
                                  <p className="text-gray-400 text-sm">{email.company || 'No company'}</p>
                                  <p className="text-gray-500 text-xs">{email.email || 'No email'}</p>
                        </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-1 rounded-full text-xs text-green-400 bg-green-400/10">
                                Active
                              </span>
                              <div className="flex items-center space-x-2 mt-2">
                                <button 
                                  onClick={() => handleSendEmail(email)}
                                  disabled={deletingEmails.has(email.id)}
                                  className="p-1 text-gray-400 hover:text-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteEmail(email)}
                                  disabled={deletingEmails.has(email.id)}
                                  className="p-1 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {deletingEmails.has(email.id) ? (
                                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
              </motion.div>
            )}

            {/* LinkedIn Tab */}
            {activeTab === 'linkedin' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >


                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={handleAddLinkedIn}
                      className="flex items-center justify-center space-x-3 p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <Plus className="w-6 h-6 text-primary-400" />
                      <span className="text-white text-lg font-medium">Add LinkedIn</span>
                    </button>
                  </div>
                </motion.div>

                  {/* LinkedIn Connections */}
                  <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  className="glass-effect rounded-2xl p-6 w-full"
                >
                  <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">LinkedIn Connections</h2>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search connections..."
                            value={linkedInSearchTerm}
                            onChange={(e) => setLinkedInSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors text-sm w-48"
                          />
                        </div>
                  </div>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {loadingLinkedIn && linkedInConnections.length === 0 ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-3 text-gray-400">Loading connections...</span>
                        </div>
                      ) : filteredLinkedInConnections.length === 0 ? (
                        <div className="text-center p-8">
                          <Users2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">
                            {linkedInSearchTerm.trim() ? 'No connections found' : 'Add your first connection to get started'}
                          </p>
                          <p className="text-gray-500 text-sm mt-2">
                            <span className="font-bold">Use the Add LinkedIn button</span>
                          </p>
                        </div>
                      ) : (
                        filteredLinkedInConnections.map((connection) => (
                          <div key={connection.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <div className="flex-1">
                        <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-primary-400" />
                        </div>
                                <div>
                                  <h3 className="text-white font-medium">{connection.name || 'No name'}</h3>
                                  <p className="text-gray-400 text-sm">{connection.company || 'No company'}</p>
                        </div>
                      </div>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-1 rounded-full text-xs text-green-400 bg-green-400/10">
                                Active
                              </span>
                              <div className="flex items-center space-x-2 mt-2">
                                <button 
                                  onClick={() => handleOpenLinkedIn(connection)}
                                  disabled={deletingLinkedIn.has(connection.id)}
                                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Open LinkedIn Profile"
                                >
                                  <Linkedin className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteLinkedIn(connection)}
                                  disabled={deletingLinkedIn.has(connection.id)}
                                  className="p-1 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {deletingLinkedIn.has(connection.id) ? (
                                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Other tabs would go here */}
            {activeTab !== 'overview' && activeTab !== 'email-list' && activeTab !== 'linkedin' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-effect rounded-2xl p-8 text-center"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon
                </h2>
                <p className="text-gray-400">
                  This feature is currently under development. Stay tuned for updates!
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        onComplete={handleChatComplete}
      />
      
      {/* LinkedIn Chat Modal */}
      <LinkedInChatModal
        isOpen={isLinkedInChatModalOpen}
        onClose={() => setIsLinkedInChatModalOpen(false)}
        onComplete={handleLinkedInChatComplete}
      />
    </SubscriptionGuard>
  )
} 