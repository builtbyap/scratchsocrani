'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SubscriptionGuard from '@/components/SubscriptionGuard'
import { getSupabaseClient } from '@/lib/supabase-client'
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
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  const fetchEmails = async () => {
    if (!user) return
    
    setLoadingEmails(true)
    try {
      const supabase = getSupabaseClient()
      console.log('🔍 Fetching emails from Supabase...')
      console.log('👤 Current user:', user)
      
      // Test the connection first
      const { data: testData, error: testError } = await supabase
        .from('emails')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('❌ Test query failed:', testError)
        console.error('❌ Error details:', {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code
        })
        setEmails([])
        return
      }
      
      console.log('✅ Test query successful, fetching full data...')
      
      const { data, error } = await supabase
        .from('emails')
        .select('*')
      
      if (error) {
        console.error('❌ Error fetching emails:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        setEmails([])
        return
      }
      
      console.log('✅ Successfully fetched emails:', data)
      setEmails(data || [])
    } catch (error) {
      console.error('❌ Unexpected error fetching emails:', error)
      setEmails([])
    } finally {
      setLoadingEmails(false)
    }
  }

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  // Fetch emails when user is authenticated
  useEffect(() => {
    if (user) {
      fetchEmails()
    }
  }, [user])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    
    try {
      const { error } = await signOut()
      if (error) {
        console.error('Error signing out:', error)
      } else {
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
    const formUrl = 'http://localhost:5678/form/6272f3aa-a2f6-417a-9977-2b11ec3488a7'
    window.open(formUrl, '_blank', 'noopener,noreferrer')
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

  const handleDeleteEmail = async (email: any) => {
    if (!user) return
    
    // Add email ID to deleting set
    setDeletingEmails(prev => new Set(prev).add(email.id))
    
    try {
      console.log('🗑️ Deleting email:', email)
      
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('emails')
        .delete()
        .eq('id', email.id)
      
      if (error) {
        console.error('❌ Error deleting email:', error)
        return
      }
      
      console.log('✅ Email deleted successfully')
      
      // Remove from local state
      setEmails(prev => prev.filter(e => e.id !== email.id))
      
      // Also remove from recently viewed if it's there
      setRecentlyViewedEmails(prev => prev.filter(e => e.id !== email.id))
      
      // Also remove from saved emails if it's there
      setSavedEmails(prev => prev.filter(e => e.id !== email.id))
      
    } catch (error) {
      console.error('❌ Unexpected error deleting email:', error)
    } finally {
      // Remove email ID from deleting set
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

  // Filter emails based on search term (company name)
  const filteredEmails = emails.filter((email: any) => {
    if (!emailSearchTerm.trim()) return true
    return email.company?.toLowerCase().includes(emailSearchTerm.toLowerCase())
  })

  // Define stats with real data
  const stats = [
    {
      title: 'Total Emails',
      value: emails.length.toString(),
      change: '+23%',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      title: 'Saved Emails',
      value: savedEmails.length.toString(),
      change: '-8%',
      icon: AlertCircle,
      color: 'text-orange-400'
    }
  ]

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

  const linkedInConnections = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Senior Product Manager',
      company: 'TechCorp Inc.',
      avatar: '/api/placeholder/40/40',
      connectionDate: '2024-01-15',
      mutualConnections: 12,
      lastInteraction: '2 days ago',
      status: 'Active',
      tags: ['Tech', 'Product', 'Networking']
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Software Engineer',
      company: 'StartupXYZ',
      avatar: '/api/placeholder/40/40',
      connectionDate: '2024-01-20',
      mutualConnections: 8,
      lastInteraction: '1 week ago',
      status: 'Active',
      tags: ['Engineering', 'Startup']
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      title: 'Marketing Director',
      company: 'Global Solutions',
      avatar: '/api/placeholder/40/40',
      connectionDate: '2024-01-10',
      mutualConnections: 15,
      lastInteraction: '3 days ago',
      status: 'Active',
      tags: ['Marketing', 'Leadership']
    },
    {
      id: 4,
      name: 'David Kim',
      title: 'UX Designer',
      company: 'Design Studio',
      avatar: '/api/placeholder/40/40',
      connectionDate: '2024-01-25',
      mutualConnections: 6,
      lastInteraction: '5 days ago',
      status: 'Inactive',
      tags: ['Design', 'UX']
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      title: 'Business Development',
      company: 'Enterprise Corp',
      avatar: '/api/placeholder/40/40',
      connectionDate: '2024-02-01',
      mutualConnections: 20,
      lastInteraction: '1 day ago',
      status: 'Active',
      tags: ['Business', 'Sales']
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

  const linkedInAnalytics = [
    {
      title: 'Profile Views',
      value: '1,247',
      change: '+23%',
      icon: Eye,
      color: 'text-blue-400'
    },
    {
      title: 'Connection Requests',
      value: '18',
      change: '+8%',
      icon: Users2,
      color: 'text-green-400'
    },
    {
      title: 'Post Reach',
      value: '45.2K',
      change: '+15%',
      icon: Share2,
      color: 'text-purple-400'
    },
    {
      title: 'Engagement Rate',
      value: '4.8%',
      change: '+2.1%',
      icon: Target,
      color: 'text-orange-400'
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
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="glass-effect rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">{stat.title}</p>
                          <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-white/10 ${stat.color}`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex items-center mt-4">
                        <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-green-400 text-sm">{stat.change}</span>
                        <span className="text-gray-400 text-sm ml-1">from last month</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Projects and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Projects */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
                      <button className="text-primary-400 hover:text-primary-300 text-sm">View All</button>
                    </div>
                    <div className="space-y-4">
                      {recentProjects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{project.name}</h3>
                            <p className="text-gray-400 text-sm">{project.client}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                            <div className="mt-2">
                              <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary-500 rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                              <p className="text-gray-400 text-xs mt-1">{project.progress}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                      <button className="text-primary-400 hover:text-primary-300 text-sm">View All</button>
                    </div>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="p-2 bg-white/10 rounded-lg">
                            <activity.icon className="w-4 h-4 text-primary-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{activity.message}</p>
                            <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Upcoming Tasks */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Upcoming Tasks</h2>
                    <button className="text-primary-400 hover:text-primary-300 text-sm">View All</button>
                  </div>
                  <div className="space-y-4">
                    {upcomingTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority).split(' ')[0]}`}></div>
                          <span className="text-white">{task.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">{task.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
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
                {/* Email List Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="glass-effect rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">{stat.title}</p>
                          <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-white/10 ${stat.color}`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex items-center mt-4">
                        <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-green-400 text-sm">{stat.change}</span>
                        <span className="text-gray-400 text-sm ml-1">from last month</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

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

                {/* Email List Table and Recent Campaigns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Email List Table */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="glass-effect rounded-2xl p-6"
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
                        <button className="text-primary-400 hover:text-primary-300 text-sm">View All</button>
                      </div>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {loadingEmails ? (
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
                                  onClick={() => handleViewEmail(email)}
                                  disabled={deletingEmails.has(email.id)}
                                  className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleSendEmail(email)}
                                  disabled={deletingEmails.has(email.id)}
                                  className="p-1 text-gray-400 hover:text-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleSaveEmail(email)}
                                  disabled={deletingEmails.has(email.id)}
                                  className="p-1 text-gray-400 hover:text-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Save className="w-4 h-4" />
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

                  {/* Recent Emails */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Recently Viewed</h2>
                      <button className="text-primary-400 hover:text-primary-300 text-sm">View All</button>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {recentlyViewedEmails.length === 0 ? (
                        <div className="text-center p-8">
                          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">No recently viewed emails</p>
                          <p className="text-gray-500 text-sm">Click the eye icon to view emails</p>
                        </div>
                      ) : (
                        recentlyViewedEmails.map((email) => (
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
                              <span className="px-2 py-1 rounded-full text-xs text-blue-400 bg-blue-400/10">
                                Viewed
                              </span>
                              <div className="flex items-center space-x-2 mt-2">
                                <button 
                                  onClick={() => handleViewEmail(email)}
                                  disabled={deletingEmails.has(email.id)}
                                  className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleSendEmail(email)}
                                  className="p-1 text-gray-400 hover:text-primary-400 transition-colors"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleSaveEmail(email)}
                                  className="p-1 text-gray-400 hover:text-primary-400 transition-colors"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteEmail(email)}
                                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>

                  {/* Saved Emails */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Saved Emails</h2>
                      <button className="text-primary-400 hover:text-primary-300 text-sm">View All</button>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {savedEmails.length === 0 ? (
                        <div className="text-center p-8">
                          <Save className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">No saved emails</p>
                          <p className="text-gray-500 text-sm">Click the save icon to save emails</p>
                        </div>
                      ) : (
                        savedEmails.map((email) => (
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
                              <span className="px-2 py-1 rounded-full text-xs text-yellow-400 bg-yellow-400/10">
                                Saved
                              </span>
                              <div className="flex items-center space-x-2 mt-2">
                                <button 
                                  onClick={() => handleViewEmail(email)}
                                  disabled={deletingEmails.has(email.id)}
                                  className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleSendEmail(email)}
                                  className="p-1 text-gray-400 hover:text-primary-400 transition-colors"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteEmail(email)}
                                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </div>
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
                {/* LinkedIn Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {linkedInAnalytics.map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="glass-effect rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">{stat.title}</p>
                          <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-white/10 ${stat.color}`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex items-center mt-4">
                        <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-green-400 text-sm">{stat.change}</span>
                        <span className="text-gray-400 text-sm ml-1">from last month</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <button className="flex items-center justify-center space-x-3 p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <Plus className="w-6 h-6 text-primary-400" />
                      <span className="text-white text-lg font-medium">Add Connection</span>
                    </button>
                  </div>
                </motion.div>

                {/* LinkedIn Connections and Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* LinkedIn Connections */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">LinkedIn Connections</h2>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search connections..."
                            className="pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors text-sm w-48"
                          />
                        </div>
                        <button className="text-primary-400 hover:text-primary-300 text-sm">View All</button>
                      </div>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {linkedInConnections.length === 0 ? (
                        <div className="text-center p-8">
                          <Users2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">No connections found</p>
                          <p className="text-gray-500 text-sm">Add your first connection to get started</p>
                        </div>
                      ) : (
                        linkedInConnections.map((connection) => (
                          <div key={connection.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-primary-400" />
                                </div>
                                <div>
                                  <h3 className="text-white font-medium">{connection.name}</h3>
                                  <p className="text-gray-400 text-sm">{connection.title}</p>
                                  <p className="text-gray-500 text-xs">{connection.company}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                connection.status === 'Active' 
                                  ? 'text-green-400 bg-green-400/10' 
                                  : 'text-gray-400 bg-gray-400/10'
                              }`}>
                                {connection.status}
                              </span>
                              <div className="flex items-center space-x-2 mt-2">
                                <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-primary-400 transition-colors">
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-primary-400 transition-colors">
                                  <Save className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>

                  {/* Recently Viewed Connections */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Recently Viewed</h2>
                      <button className="text-primary-400 hover:text-primary-300 text-sm">View All</button>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="text-center p-8">
                        <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No recently viewed connections</p>
                        <p className="text-gray-500 text-sm">Click the eye icon to view connections</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Saved Connections */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Saved Connections</h2>
                      <button className="text-primary-400 hover:text-primary-300 text-sm">View All</button>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="text-center p-8">
                        <Save className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No saved connections</p>
                        <p className="text-gray-500 text-sm">Click the save icon to save connections</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
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
    </SubscriptionGuard>
  )
} 