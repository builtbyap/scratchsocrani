import { DownloadButtons } from "@/components/download-buttons"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0A111F] text-white flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <header className="w-full max-w-6xl flex justify-between items-center mb-12">
        <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center text-lg font-bold text-blue-400">
          <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
          Socrani Dashboard
        </div>
      </header>

      <main className="flex flex-col items-center text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Your Socrani Dashboard</h1>
        <p className="text-lg text-gray-400 max-w-2xl mb-12">
          Manage your subscription and download the Socrani desktop application.
        </p>

        {/* Download Section */}
        <DownloadButtons />

        {/* You can add more dashboard content here */}
        <div className="mt-16 text-gray-400">
          <p>More features coming soon!</p>
        </div>
      </main>
    </div>
  )
}
