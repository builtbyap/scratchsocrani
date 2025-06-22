'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
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
  ArrowRight
} from 'lucide-react'

const stats = [
  {
    title: 'Total Projects',
    value: '24',
    change: '+12%',
    icon: Folder,
    color: 'text-blue-400'
  },
  {
    title: 'Active Clients',
    value: '18',
    change: '+8%',
    icon: Users,
    color: 'text-green-400'
  },
  {
    title: 'Revenue',
    value: '$45.2K',
    change: '+23%',
    icon: DollarSign,
    color: 'text-purple-400'
  },
  {
    title: 'Tasks Completed',
    value: '156',
    change: '+15%',
    icon: CheckCircle,
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
        // Redirect to homepage after successful sign out
        router.push('/')
      }
    } catch (err) {
      console.error('Error signing out:', err)
    } finally {
      setIsSigningOut(false)
    }
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
            <span className="gradient-text">TechFlow</span>
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
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'projects'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Folder className="w-5 h-5" />
              <span>Projects</span>
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'clients'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Clients</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'messages'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Messages</span>
            </button>
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
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
              <button className="p-2 bg-white/10 border border-white/20 rounded-xl text-gray-300 hover:bg-white/20 hover:text-white transition-all duration-200">
                <User className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="glass-effect rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="mb-2">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                </div>
                <p className="text-sm text-green-400">{stat.change} from last month</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Projects */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="glass-effect rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
                  <button className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors">
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-400 mb-2">{project.client}</p>
                        <div className="flex items-center space-x-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">Progress</div>
                        <div className="text-lg font-semibold text-white">{project.progress}%</div>
                        <div className="text-xs text-gray-400">Due: {project.dueDate}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Sidebar Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-6"
            >
              {/* Upcoming Tasks */}
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Tasks</h3>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority).split(' ')[0]}`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{task.title}</p>
                        <p className="text-xs text-gray-400">{task.dueDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="p-2 bg-primary-500/20 rounded-lg">
                        <activity.icon className="w-4 h-4 text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{activity.message}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 