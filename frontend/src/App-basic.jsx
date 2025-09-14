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
import { TrendingUp, Users, DollarSign, Target, Sparkles, Download, Share2, AlertCircle, CheckCircle, Clock } from 'lucide-react'

// Mock data for when backend is unavailable
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
    { name: 'Luxury Enthusiasts', value: 35, color: '#D4AF37' },
    { name: 'High-Net-Worth', value: 28, color: '#B8860B' },
    { name: 'Brand Loyalists', value: 22, color: '#DAA520' },
    { name: 'Aspirational', value: 15, color: '#F4E4BC' }
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
  const [connectionStatus, setConnectionStatus] = useState('connecting')
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

  // Try to connect to backend, fallback to mock data
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
          // Try to load real data here if needed
        } else {
          throw new Error('Backend not available')
        }
      } catch (error) {
        console.log('Backend not available, using mock data')
        setConnectionStatus('mock')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  ImpactLens
                </h1>
                <p className="text-sm text-slate-600">Partnership Intelligence Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={connectionStatus === 'connected' ? 'default' : connectionStatus === 'mock' ? 'secondary' : 'outline'}>
                {connectionStatus === 'connected' ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : connectionStatus === 'mock' ? (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Demo Mode
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    Connecting...
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
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="luxury-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Partnership ROI</p>
                      <p className="text-3xl font-bold text-slate-900">{dashboardData.stats.partnership_roi}%</p>
                      <p className="text-xs text-green-600">↑ 12.5% vs last quarter</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="luxury-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Brand Reach</p>
                      <p className="text-3xl font-bold text-slate-900">{dashboardData.stats.brand_reach}M</p>
                      <p className="text-xs text-green-600">↑ 18.2% vs last quarter</p>
                    </div>
                    <Users className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="luxury-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Audience Growth</p>
                      <p className="text-3xl font-bold text-slate-900">{dashboardData.stats.audience_growth}K</p>
                      <p className="text-xs text-green-600">↑ 8.7% vs last quarter</p>
                    </div>
                    <Target className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="luxury-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Sales Impact</p>
                      <p className="text-3xl font-bold text-slate-900">${dashboardData.stats.sales_impact}M</p>
                      <p className="text-xs text-red-600">↓ 3.1% vs last quarter</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Partnership Performance
                  </CardTitle>
                  <CardDescription>Key metrics across partnership dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#D4AF37" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Audience Breakdown
                  </CardTitle>
                  <CardDescription>Target audience composition analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData.audienceBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {dashboardData.audienceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {dashboardData.audienceBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ROI Projection */}
            <Card className="luxury-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  ROI Projection & Reach Growth
                </CardTitle>
                <CardDescription>6-month partnership performance forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.roiProjection}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="roi" stroke="#D4AF37" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Scenario Form */}
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle>Create New Partnership Scenario</CardTitle>
                  <CardDescription>
                    Analyze potential brand partnerships with AI-powered insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brandA">Brand A *</Label>
                        <Input
                          id="brandA"
                          placeholder="e.g., Louis Vuitton"
                          value={formData.brandA}
                          onChange={(e) => setFormData(prev => ({ ...prev, brandA: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brandB">Brand B *</Label>
                        <Input
                          id="brandB"
                          placeholder="e.g., Tesla"
                          value={formData.brandB}
                          onChange={(e) => setFormData(prev => ({ ...prev, brandB: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partnershipType">Partnership Type *</Label>
                      <Select value={formData.partnershipType} onValueChange={(value) => setFormData(prev => ({ ...prev, partnershipType: value }))}>
                        <SelectTrigger>
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
                      <Label htmlFor="targetAudience">Target Audience</Label>
                      <Input
                        id="targetAudience"
                        placeholder="e.g., High-net-worth millennials"
                        value={formData.targetAudience}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budgetRange">Budget Range</Label>
                      <Select value={formData.budgetRange} onValueChange={(value) => setFormData(prev => ({ ...prev, budgetRange: value }))}>
                        <SelectTrigger>
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
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
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
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    {scenarios.length > 0 ? 'AI-powered partnership insights' : 'Results will appear here after analysis'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {scenarios.length > 0 ? (
                    <div className="space-y-4">
                      {scenarios.map((scenario) => (
                        <div key={scenario.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{scenario.brand_a} × {scenario.brand_b}</h3>
                            <Badge variant="outline">{scenario.partnership_type}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-primary/5 rounded-lg">
                              <div className="text-xl font-bold text-primary">{scenario.analysis_results.brand_alignment_score}/10</div>
                              <div className="text-sm text-muted-foreground">Brand Alignment</div>
                            </div>
                            <div className="text-center p-3 bg-primary/5 rounded-lg">
                              <div className="text-xl font-bold text-primary">{scenario.analysis_results.audience_overlap_percentage}%</div>
                              <div className="text-sm text-muted-foreground">Audience Overlap</div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Ready for Analysis</h3>
                      <p className="text-muted-foreground">
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
            <Card className="luxury-shadow">
              <CardHeader>
                <CardTitle>Partner Directory</CardTitle>
                <CardDescription>Manage and discover potential partnership opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Partner Directory</h3>
                  <p className="text-muted-foreground">
                    Partner management features coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="luxury-shadow">
              <CardHeader>
                <CardTitle>Analytics Reports</CardTitle>
                <CardDescription>Comprehensive partnership performance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Reports</h3>
                  <p className="text-muted-foreground">
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
