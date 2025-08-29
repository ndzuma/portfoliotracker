"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Plus, TrendingUp, TrendingDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { type Portfolio, type Benchmark, AISummaryCard } from "@/components/types"

export default function Dashboard() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null)
  const [newPortfolio, setNewPortfolio] = useState({
    name: "",
    description: "",
    type: "personal",
    initialInvestment: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfoliosRes, benchmarksRes] = await Promise.all([fetch("/api/portfolios"), fetch("/api/benchmarks")])

        const portfoliosData = await portfoliosRes.json()
        const benchmarksData = await benchmarksRes.json()

        setPortfolios(portfoliosData.personal || [])
        setBenchmarks(benchmarksData.benchmarks || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setPortfolios([])
        setBenchmarks([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalPortfolioValue = portfolios.reduce((sum, portfolio) => sum + portfolio.value, 0)
  const totalChange = portfolios.reduce((sum, portfolio) => sum + portfolio.change, 0)
  const totalChangePercent = totalPortfolioValue > 0 ? (totalChange / totalPortfolioValue) * 100 : 0

  const handleCreatePortfolio = () => {
    if (!newPortfolio.name) return

    const portfolio: Portfolio = {
      id: Date.now().toString(),
      name: newPortfolio.name,
      description: newPortfolio.description,
      value: Number.parseFloat(newPortfolio.initialInvestment) || 0,
      change: 0,
      changePercent: 0,
      stocks: 0,
      modified: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      assets: [],
    }

    setPortfolios([...portfolios, portfolio])
    setNewPortfolio({ name: "", description: "", type: "personal", initialInvestment: "" })
    setIsCreateModalOpen(false)
  }

  const handleDeletePortfolio = (id: string) => {
    setPortfolios(portfolios.filter((p) => p.id !== id))
  }

  const handleEditPortfolio = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio)
    setNewPortfolio({
      name: portfolio.name,
      description: portfolio.description,
      type: "personal",
      initialInvestment: portfolio.value.toString(),
    })
  }

  const handleUpdatePortfolio = () => {
    if (!editingPortfolio || !newPortfolio.name) return

    const updatedPortfolios = portfolios.map((p) =>
      p.id === editingPortfolio.id ? { ...p, name: newPortfolio.name, description: newPortfolio.description } : p,
    )

    setPortfolios(updatedPortfolios)
    setEditingPortfolio(null)
    setNewPortfolio({ name: "", description: "", type: "personal", initialInvestment: "" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading portfolios...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Total Portfolio Value and Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Total Portfolio Value */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
            <div className={`flex items-center text-sm ${totalChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}$
              {Math.abs(totalChange).toLocaleString()} ({totalChangePercent.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>

        {/* Benchmarks */}
        {benchmarks.slice(0, 3).map((benchmark) => (
          <Card key={benchmark.id || benchmark.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{benchmark.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{benchmark.value.toLocaleString()}</div>
              <div className={`flex items-center text-sm ${benchmark.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {benchmark.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {benchmark.change >= 0 ? "+" : ""}
                {benchmark.change.toFixed(2)} ({benchmark.changePercent.toFixed(2)}%)
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Summary and Portfolio List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Portfolio List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Portfolios ({portfolios.length})</h2>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-800 hover:bg-gray-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create portfolio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPortfolio ? "Edit Portfolio" : "Create New Portfolio"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Portfolio Name</Label>
                    <Input
                      id="name"
                      value={newPortfolio.name}
                      onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })}
                      placeholder="Enter portfolio name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newPortfolio.description}
                      onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                      placeholder="Enter portfolio description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Portfolio Type</Label>
                    <Select
                      value={newPortfolio.type}
                      onValueChange={(value) => setNewPortfolio({ ...newPortfolio, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="retirement">Retirement</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="investment">Initial Investment (Optional)</Label>
                    <Input
                      id="investment"
                      type="number"
                      value={newPortfolio.initialInvestment}
                      onChange={(e) => setNewPortfolio({ ...newPortfolio, initialInvestment: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <Button
                    onClick={editingPortfolio ? handleUpdatePortfolio : handleCreatePortfolio}
                    className="w-full"
                    disabled={!newPortfolio.name}
                  >
                    {editingPortfolio ? "Update Portfolio" : "Create Portfolio"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Valuation</th>
                      <th className="text-left p-4 font-medium">Modified</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolios.map((portfolio) => (
                      <tr key={portfolio.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <Link href={`/dashboard/portfolio/${portfolio.id}`} className="hover:underline">
                            <div className="font-medium">{portfolio.name}</div>
                            <div className="text-sm text-muted-foreground">{portfolio.description}</div>
                          </Link>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">${portfolio.value.toLocaleString()}</div>
                          <div
                            className={`text-sm flex items-center ${portfolio.change >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {portfolio.change >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {portfolio.change >= 0 ? "+" : ""}${portfolio.change.toLocaleString()} (
                            {portfolio.changePercent.toFixed(2)}%)
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{portfolio.modified}</td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditPortfolio(portfolio)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeletePortfolio(portfolio.id)}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Summary */}
        <div className="lg:col-span-1">
          <AISummaryCard
            title="Portfolio AI Summary"
            content="Your portfolio shows strong diversification across technology and growth sectors. Current allocation favors high-growth stocks with 65% in tech companies. Consider rebalancing towards defensive sectors for better risk management. The recent 10.01% gain indicates good momentum, but watch for potential volatility in the coming quarter."
          />
        </div>
      </div>
    </div>
  )
}
