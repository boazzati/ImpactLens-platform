import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, Users, DollarSign, Target, Sparkles, Download, Share2, AlertCircle, CheckCircle, Clock, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react'

// Mock data for professional demo
const mockDashboardData = {
  stats: {
    partnership_roi: 324,
    brand_reach: 2.4,
    audience_growth: 156,
    sales_impact: 1.2
  },
  performanceData: [
    { name: 'Brand Alignment', value: 85 },
    { name: 'Audience Overlap', value: 72 },
    { name: 'Market Synergy', value: 91 },
    { name: 'Risk Assessment', value: 78 }
  ],
  audienceBreakdown: [
    { name: 'Luxury Enthusiasts', value: 35, color: '#1e40af' },
    { name: 'High-Net-Worth', value: 28, color: '#3b82f6' },
    { name: 'Brand Loyalists', value: 22, color: '#60a5fa' },
    { name: 'Aspirational', value: 15, color: '#93c5fd' }
  ],
  roiProjection: [
    { month: 'Jan', roi: 120 },
    { month: 'Feb', roi: 145 },
    { month: 'Mar', roi: 180 },
    { month: 'Apr', roi: 220 },
    { month: 'May', roi: 280 },
    { month: 'Jun', roi: 324 }
  ]
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [connectionStatus, setConnectionStatus] = useState('demo')
  const [dashboardData, setDashboardData] = useState(mockDashboardData)
  const [scenarios, setScenarios] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    brandA: '',
    brandB: '',
    partnershipType: '',
    targetAudience: '',
    budgetRange: ''
  })

  // Try to connect to backend, fallback to demo mode
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const apiUrl = import.meta.env.REACT_APP_API_URL || 'https://impactlens-platform-20d6698d163f.herokuapp.com'
        const response = await fetch(`${apiUrl}/api/health`, { 
          method: 'GET',
          timeout: 5000 
        })
        
        if (response.ok) {
          setConnectionStatus('connected')
        } else {
          throw new Error('Backend not available')
        }
      } catch (error) {
        setConnectionStatus('demo')
      }
    }

    checkConnection()
  }, [])

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate analysis with mock data
    setTimeout(() => {
      const newScenario = {
        id: Date.now(),
        brand_a: formData.brandA,
        brand_b: formData.brandB,
        partnership_type: formData.partnershipType,
        target_audience: formData.targetAudience,
        budget_range: formData.budgetRange,
        status: 'completed',
        created_at: new Date().toISOString(),
        analysis_results: {
          brand_alignment_score: Math.floor(Math.random() * 3) + 8,
          audience_overlap_percentage: Math.floor(Math.random() * 20) + 65,
          roi_projection: Math.floor(Math.random() * 100) + 200,
          risk_level: ['low', 'medium'][Math.floor(Math.random() * 2)],
          recommendations: JSON.stringify([
            'Leverage complementary brand values for authentic messaging',
            'Focus on shared premium customer segments',
            'Implement phased rollout to minimize risk'
          ])
        }
      }
      
      setScenarios(prev => [newScenario, ...prev])
      setIsLoading(false)
      
      // Reset form
      setFormData({
        brandA: '',
        brandB: '',
        partnershipType: '',
        targetAudience: '',
        budgetRange: ''
      })
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Professional Header */}
      <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
                  ImpactLens
                </h1>
                <p className="text-sm text-slate-600 font-medium">Partnership Intelligence Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge 
                variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
                className={`${
                  connectionStatus === 'connected' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                } px-3 py-1`}
              >
                {connectionStatus === 'connected' ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Live Data
                  </>
                ) : (
                  <>
                    <Activity className="h-3 w-3 mr-1" />
                    Demo Mode
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px] bg-white shadow-sm border border-slate-200">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Dashboard</TabsTrigger>
            <TabsTrigger value="scenarios" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Scenarios</TabsTrigger>
            <TabsTrigger value="partners" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Partners</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Reports</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Partnership ROI</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{dashboardData.stats.partnership_roi}%</p>
                      <p className="text-sm text-green-600 font-medium mt-1">↑ 12.5% vs last quarter</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Brand Reach</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{dashboardData.stats.brand_reach}M</p>
                      <p className="text-sm text-green-600 font-medium mt-1">↑ 18.2% vs last quarter</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Audience Growth</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{dashboardData.stats.audience_growth}K</p>
                      <p className="text-sm text-green-600 font-medium mt-1">↑ 8.7% vs last quarter</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Sales Impact</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">${dashboardData.stats.sales_impact}M</p>
                      <p className="text-sm text-red-600 font-medium mt-1">↓ 3.1% vs last quarter</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    Partnership Performance
                  </CardTitle>
                  <CardDescription className="text-slate-600">Key metrics across partnership dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={dashboardData.performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                      <Bar dataKey="value" fill="url(#blueGradient)" radius={[4, 4, 0, 0]} />
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#1e40af" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <PieChartIcon className="h-4 w-4 text-white" />
                    </div>
                    Audience Breakdown
                  </CardTitle>
                  <CardDescription className="text-slate-600">Target audience composition analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={dashboardData.audienceBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {dashboardData.audienceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {dashboardData.audienceBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="font-medium text-slate-700">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ROI Projection */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  ROI Projection & Growth Forecast
                </CardTitle>
                <CardDescription className="text-slate-600">6-month partnership performance trajectory</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={dashboardData.roiProjection} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="roi" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Create Scenario Form */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-bold text-slate-900">Create Partnership Scenario</CardTitle>
                  <CardDescription className="text-slate-600">
                    Analyze potential brand partnerships with AI-powered insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brandA" className="text-sm font-semibold text-slate-700">Brand A *</Label>
                        <Input
                          id="brandA"
                          placeholder="e.g., Louis Vuitton"
                          value={formData.brandA}
                          onChange={(e) => setFormData(prev => ({ ...prev, brandA: e.target.value }))}
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brandB" className="text-sm font-semibold text-slate-700">Brand B *</Label>
                        <Input
                          id="brandB"
                          placeholder="e.g., Tesla"
                          value={formData.brandB}
                          onChange={(e) => setFormData(prev => ({ ...prev, brandB: e.target.value }))}
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partnershipType" className="text-sm font-semibold text-slate-700">Partnership Type *</Label>
                      <Select value={formData.partnershipType} onValueChange={(value) => setFormData(prev => ({ ...prev, partnershipType: value }))}>
                        <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select partnership type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="co-branding">Co-branding</SelectItem>
                          <SelectItem value="sponsorship">Sponsorship</SelectItem>
                          <SelectItem value="product-collaboration">Product Collaboration</SelectItem>
                          <SelectItem value="licensing">Licensing Agreement</SelectItem>
                          <SelectItem value="joint-venture">Joint Venture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetAudience" className="text-sm font-semibold text-slate-700">Target Audience</Label>
                      <Input
                        id="targetAudience"
                        placeholder="e.g., High-net-worth millennials"
                        value={formData.targetAudience}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budgetRange" className="text-sm font-semibold text-slate-700">Budget Range</Label>
                      <Select value={formData.budgetRange} onValueChange={(value) => setFormData(prev => ({ ...prev, budgetRange: value }))}>
                        <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-100k">Under $100K</SelectItem>
                          <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                          <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                          <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                          <SelectItem value="over-5m">Over $5M</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 shadow-lg"
                      disabled={isLoading || !formData.brandA || !formData.brandB || !formData.partnershipType}
                    >
                      {isLoading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing Partnership...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Analyze Partnership
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-bold text-slate-900">Analysis Results</CardTitle>
                  <CardDescription className="text-slate-600">
                    {scenarios.length > 0 ? 'AI-powered partnership insights' : 'Results will appear here after analysis'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {scenarios.length > 0 ? (
                    <div className="space-y-6">
                      {scenarios.map((scenario) => (
                        <div key={scenario.id} className="border border-slate-200 rounded-xl p-6 bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-slate-900">{scenario.brand_a} × {scenario.brand_b}</h3>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                              {scenario.partnership_type}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                              <div className="text-2xl font-bold text-blue-600">{scenario.analysis_results.brand_alignment_score}/10</div>
                              <div className="text-sm text-slate-600 font-medium">Brand Alignment</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                              <div className="text-2xl font-bold text-green-600">{scenario.analysis_results.audience_overlap_percentage}%</div>
                              <div className="text-sm text-slate-600 font-medium">Audience Overlap</div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button variant="outline" size="sm" className="flex-1 border-slate-300 hover:bg-slate-100">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 border-slate-300 hover:bg-slate-100">
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Ready for Analysis</h3>
                      <p className="text-slate-600 max-w-sm mx-auto">
                        Fill in the partnership details and click "Analyze Partnership" to get AI-powered insights.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-bold text-slate-900">Partner Directory</CardTitle>
                <CardDescription className="text-slate-600">Manage and discover potential partnership opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Partner Directory</h3>
                  <p className="text-slate-600 max-w-sm mx-auto">
                    Partner management features coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-bold text-slate-900">Analytics Reports</CardTitle>
                <CardDescription className="text-slate-600">Comprehensive partnership performance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Advanced Reports</h3>
                  <p className="text-slate-600 max-w-sm mx-auto">
                    Detailed analytics and reporting features coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App
