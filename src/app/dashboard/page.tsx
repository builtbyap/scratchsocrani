'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SubscriptionGuard from '@/components/SubscriptionGuard'
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
  Zap
} from 'lucide-react'

const stats = [
  {
    title: 'Total Subscribers',
    value: '1,247',
    change: '+23%',
    icon: Users,
    color: 'text-blue-400'
  },
  {
    title: 'Open Rate',
    value: '68.5%',
    change: '+5.2%',
    icon: MailOpen,
    color: 'text-green-400'
  },
  {
    title: 'Click Rate',
    value: '12.3%',
    change: '+2.1%',
    icon: MailCheck,
    color: 'text-purple-400'
  },
  {
    title: 'Unsubscribes',
    value: '23',
    change: '-8%',
    icon: AlertCircle,
    color: 'text-orange-400'
  }
]

const emailList = [
  {
    id: 1,
    email: 'john.doe@example.com',
    name: 'John Doe',
    status: 'Active',
    subscribedDate: '2024-01-15',
    lastEmailSent: '2024-02-01',
    openRate: 85,
    clickRate: 15,
    tags: ['VIP', 'Newsletter']
  },
  {
    id: 2,
    email: 'jane.smith@company.com',
    name: 'Jane Smith',
    status: 'Active',
    subscribedDate: '2024-01-20',
    lastEmailSent: '2024-02-01',
    openRate: 72,
    clickRate: 8,
    tags: ['Newsletter']
  },
  {
    id: 3,
    email: 'mike.wilson@startup.io',
    name: 'Mike Wilson',
    status: 'Inactive',
    subscribedDate: '2024-01-10',
    lastEmailSent: '2024-01-25',
    openRate: 45,
    clickRate: 3,
    tags: ['Promotional']
  },
  {
    id: 4,
    email: 'sarah.jones@tech.com',
    name: 'Sarah Jones',
    status: 'Active',
    subscribedDate: '2024-01-28',
    lastEmailSent: '2024-02-01',
    openRate: 91,
    clickRate: 22,
    tags: ['VIP', 'Newsletter', 'Promotional']
  },
  {
    id: 5,
    email: 'alex.brown@design.co',
    name: 'Alex Brown',
    status: 'Active',
    subscribedDate: '2024-02-01',
    lastEmailSent: '2024-02-01',
    openRate: 78,
    clickRate: 12,
    tags: ['Newsletter']
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

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

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
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors"
                  />
                </div>
                <button className="p-2 bg-white/10 border border-white/20 rounded-xl text-gray-300 hover:bg-white/20 hover:text-white transition-all duration-200">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add Subscriber</span>
                </button>
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
                  <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <Plus className="w-5 h-5 text-primary-400" />
                      <span className="text-white">Add Subscriber</span>
                    </button>
                    <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <Mail className="w-5 h-5 text-primary-400" />
                      <span className="text-white">Create Campaign</span>
                    </button>
                    <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <BarChart3 className="w-5 h-5 text-primary-400" />
                      <span className="text-white">View Analytics</span>
                    </button>
                  </div>
                </motion.div>

                {/* Email List Table and Recent Campaigns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Email List Table */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Subscribers</h2>
                      <button className="text-primary-400 hover:text-primary-300 text-sm">View All</button>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {emailList.map((subscriber) => (
                        <div key={subscriber.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-400" />
                              </div>
                              <div>
                                <h3 className="text-white font-medium">{subscriber.name}</h3>
                                <p className="text-gray-400 text-sm">{subscriber.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              {subscriber.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              subscriber.status === 'Active' 
                                ? 'text-green-400 bg-green-400/10' 
                                : 'text-gray-400 bg-gray-400/10'
                            }`}>
                              {subscriber.status}
                            </span>
                            <div className="flex items-center space-x-2 mt-2">
                              <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Recent Campaigns */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Recent Campaigns</h2>
                      <button className="text-primary-400 hover:text-primary-300 text-sm">View All</button>
                    </div>
                    <div className="space-y-4">
                      {recentCampaigns.map((campaign) => (
                        <div key={campaign.id} className="p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-medium">{campaign.name}</h3>
                            <span className="text-green-400 text-sm">{campaign.status}</span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">Sent {campaign.sentDate} • {campaign.recipients} recipients</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-400 text-xs">Open Rate</p>
                              <p className="text-white font-medium">{campaign.openRate}%</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Click Rate</p>
                              <p className="text-white font-medium">{campaign.clickRate}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
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
                {/* LinkedIn Analytics */}
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
                  <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <Plus className="w-5 h-5 text-primary-400" />
                      <span className="text-white">New Post</span>
                    </button>
                    <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <Users2 className="w-5 h-5 text-primary-400" />
                      <span className="text-white">Find Connections</span>
                    </button>
                    <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <BarChart3 className="w-5 h-5 text-primary-400" />
                      <span className="text-white">View Analytics</span>
                    </button>
                    <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <Globe className="w-5 h-5 text-primary-400" />
                      <span className="text-white">Update Profile</span>
                    </button>
                  </div>
                </motion.div>

                {/* Connections and Posts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* LinkedIn Connections */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Recent Connections</h2>
                      <button className="text-primary-400 hover:text-primary-300 text-sm">View All</button>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {linkedInConnections.map((connection) => (
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
                            <div className="flex items-center space-x-2 mt-2">
                              {connection.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                                  {tag}
                                </span>
                              ))}
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
                            <p className="text-gray-400 text-xs mt-1">{connection.mutualConnections} mutual</p>
                            <p className="text-gray-500 text-xs">{connection.lastInteraction}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-primary-400 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* LinkedIn Posts */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="glass-effect rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Recent Posts</h2>
                      <button className="text-primary-400 hover:text-primary-300 text-sm">View All</button>
                    </div>
                    <div className="space-y-4">
                      {linkedInPosts.map((post) => (
                        <div key={post.id} className="p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-medium">{post.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              post.status === 'Published' 
                                ? 'text-green-400 bg-green-400/10' 
                                : 'text-yellow-400 bg-yellow-400/10'
                            }`}>
                              {post.status}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.content}</p>
                          {post.publishedDate && (
                            <p className="text-gray-500 text-xs mb-3">Published {post.publishedDate}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>{post.likes}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{post.comments}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Share2 className="w-3 h-3" />
                                <span>{post.shares}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{post.views}</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-primary-400 transition-colors">
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
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