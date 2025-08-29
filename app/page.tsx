import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, TrendingUp, Shield, BarChart3, Users, Star, ChevronDown } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <TrendingUp className="h-6 w-6" />
              <span className="font-bold">PortfolioTracker</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Features
              </Link>
              <Link href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Pricing
              </Link>
              <Link href="#testimonials" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Testimonials
              </Link>
              <Link href="#faq" className="transition-colors hover:text-foreground/80 text-foreground/60">
                FAQ
              </Link>
            </nav>
            <div className="flex items-center space-x-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-32">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <Badge variant="secondary" className="rounded-full px-4 py-1.5">
            Track Your Investments Like a Pro
          </Badge>
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-balance">
            Master Your Portfolio with <span className="text-primary">Smart Analytics</span>
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 text-balance">
            Take control of your investments with real-time tracking, AI-powered insights, and comprehensive portfolio
            management tools.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Start Tracking Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="container py-8 md:py-12">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <p className="text-sm text-muted-foreground">Trusted by investors worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="h-8 w-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Everything you need to manage your portfolio
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Focus on growing your wealth instead of managing spreadsheets
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <Card className="p-6">
            <div className="flex h-[180px] flex-col justify-between">
              <BarChart3 className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Real-time Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your investments with live market data and instant portfolio updates.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex h-[180px] flex-col justify-between">
              <Shield className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Bank-level security with end-to-end encryption to protect your financial data.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex h-[180px] flex-col justify-between">
              <TrendingUp className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">AI Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized recommendations and market insights powered by AI.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex h-[180px] flex-col justify-between">
              <Users className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Multi-Portfolio</h3>
                <p className="text-sm text-muted-foreground">
                  Manage multiple portfolios for different investment strategies.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex h-[180px] flex-col justify-between">
              <BarChart3 className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">Detailed performance metrics and risk analysis tools.</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex h-[180px] flex-col justify-between">
              <CheckCircle className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Easy Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Get started in minutes with our intuitive onboarding process.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-24 bg-muted/50">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">How it works?</h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Get started with your portfolio in 3 simple steps
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-3 md:max-w-[64rem]">
          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              1
            </div>
            <h3 className="font-bold mb-2">Connect Your Accounts</h3>
            <p className="text-sm text-muted-foreground">
              Securely link your investment accounts or manually add your holdings.
            </p>
          </Card>
          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              2
            </div>
            <h3 className="font-bold mb-2">Track Performance</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your portfolio's performance with real-time data and analytics.
            </p>
          </Card>
          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              3
            </div>
            <h3 className="font-bold mb-2">Make Informed Decisions</h3>
            <p className="text-sm text-muted-foreground">
              Use AI insights and analytics to optimize your investment strategy.
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">Simple, transparent pricing</h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Choose the plan that's right for your investment journey
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-3 md:max-w-[64rem]">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold">Starter</h3>
                <p className="text-muted-foreground">Perfect for beginners</p>
              </div>
              <div className="text-3xl font-bold">
                $0<span className="text-lg font-normal">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Up to 3 portfolios
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Basic analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Mobile app access
                </li>
              </ul>
              <Button className="w-full bg-transparent" variant="outline">
                Get Started
              </Button>
            </div>
          </Card>
          <Card className="p-6 border-primary">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <Badge>Most Popular</Badge>
                </div>
                <p className="text-muted-foreground">For serious investors</p>
              </div>
              <div className="text-3xl font-bold">
                $19<span className="text-lg font-normal">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Unlimited portfolios
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  AI insights
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Priority support
                </li>
              </ul>
              <Button className="w-full">Get Started</Button>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold">Enterprise</h3>
                <p className="text-muted-foreground">For institutions</p>
              </div>
              <div className="text-3xl font-bold">
                $99<span className="text-lg font-normal">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Custom integrations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Dedicated support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  White-label options
                </li>
              </ul>
              <Button className="w-full bg-transparent" variant="outline">
                Contact Sales
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container space-y-6 py-8 md:py-12 lg:py-24 bg-muted/50">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">Loved by investors worldwide</h2>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-3 md:max-w-[64rem]">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm">
                "PortfolioTracker has completely transformed how I manage my investments. The AI insights are incredibly
                valuable."
              </p>
              <div>
                <p className="font-semibold">Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">Individual Investor</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm">
                "The real-time tracking and analytics have helped me make better investment decisions and improve my
                returns."
              </p>
              <div>
                <p className="font-semibold">Michael Chen</p>
                <p className="text-sm text-muted-foreground">Financial Advisor</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm">
                "Simple, intuitive, and powerful. Everything I need to track my portfolio performance in one place."
              </p>
              <div>
                <p className="font-semibold">Emily Rodriguez</p>
                <p className="text-sm text-muted-foreground">Portfolio Manager</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">Frequently Asked Questions</h2>
        </div>
        <div className="mx-auto max-w-[42rem] space-y-4">
          {[
            {
              question: "How secure is my financial data?",
              answer: "We use bank-level security with 256-bit SSL encryption and never store your login credentials.",
            },
            {
              question: "Can I track multiple portfolios?",
              answer: "Yes, you can create and manage multiple portfolios for different investment strategies.",
            },
            {
              question: "Do you support international markets?",
              answer: "We support major international exchanges and markets worldwide.",
            },
            {
              question: "Is there a mobile app?",
              answer: "Yes, our mobile app is available for both iOS and Android devices.",
            },
          ].map((faq, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{faq.question}</h3>
                <ChevronDown className="h-4 w-4" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <Card className="p-8 md:p-12 text-center">
          <div className="mx-auto max-w-[58rem] space-y-4">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Ready to take control of your investments?
            </h2>
            <p className="max-w-[85%] mx-auto leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Join thousands of investors who trust PortfolioTracker to manage their wealth.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/dashboard">
                <Button size="lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Schedule Demo
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 PortfolioTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
