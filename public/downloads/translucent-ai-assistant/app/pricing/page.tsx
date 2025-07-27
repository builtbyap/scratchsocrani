import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowLeft, Sparkles } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0A111F] text-white flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <header className="w-full max-w-6xl flex justify-between items-center mb-12">
        <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center text-lg font-bold text-blue-400">
          <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
          Socrani
        </div>
      </header>

      <main className="flex flex-col items-center text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Choose Your Plan</h1>
        <p className="text-lg text-gray-400 max-w-2xl">
          Select the perfect plan for your needs. All plans include unlimited email searches and LinkedIn connections.
        </p>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Monthly Plan Card */}
          <Card className="bg-[#1A202C] border border-gray-700 rounded-xl p-8 flex flex-col items-center shadow-lg">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-3xl font-bold text-white mb-2">Monthly</CardTitle>
              <div className="text-5xl font-extrabold text-white">
                $15.00<span className="text-xl font-normal text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mt-2">Perfect for short term</p>
            </CardHeader>
            <CardContent className="p-0 w-full">
              <ul className="space-y-3 text-left text-gray-300 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3" />
                  Unlimited monthly usage
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3" />
                  Unlimited Emails
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3" />
                  Most powerful agent models
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3" />
                  24/7 customer support
                </li>
              </ul>
              <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg text-lg font-semibold transition-colors">
                Get Monthly
              </Button>
            </CardContent>
          </Card>

          {/* Annual Plan Card */}
          <Card className="bg-[#1A202C] border-2 border-blue-500 rounded-xl p-8 flex flex-col items-center shadow-lg relative">
            <div className="absolute -top-4 px-4 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-md">
              Most Popular
            </div>
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-3xl font-bold text-white mb-2">Annual</CardTitle>
              <div className="text-5xl font-extrabold text-white">
                $50.00<span className="text-xl font-normal text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mt-2">Best value for regular users</p>
            </CardHeader>
            <CardContent className="p-0 w-full">
              <ul className="space-y-3 text-left text-gray-300 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3" />
                  Unlimited yearly usage
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3" />
                  Unlimited Emails
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3" />
                  Most powerful agent models
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3" />
                  24/7 customer support
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition-colors">
                Get Annual
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 w-full max-w-4xl text-left">
          <h2 className="text-3xl font-bold mb-8 text-white text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-400">
                Yes, you can cancel your subscription at any time. No long-term contracts required.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">
                We accept all major credit cards through our secure Stripe payment system.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">How many emails can I find?</h3>
              <p className="text-gray-400">
                Unlimited! You can search for as many emails and LinkedIn connections as you need.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-gray-400">
                Yes, you can change your plan at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
