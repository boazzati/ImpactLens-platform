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
import { TrendingUp, Users, DollarSign, Target, Sparkles, Download, Share2, AlertCircle, CheckCircle, Clock, BarChart3, PieChart as PieChartIcon, Activity, Settings, Bell, User } from 'lucide-react'

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
    { name: 'Luxury Enthusiasts', value: 35, color: 'oklch(0.55 0.15 85)' },
    { name: 'High-Net-Worth', value: 28, color: 'oklch(0.65 0.12 85)' },
    { name: 'Brand Loyalists', value: 22, color: 'oklch(0.75 0.08 85)' },
    { name: 'Aspirational', value: 15, color: 'oklch(0.45 0.18 85)' }
  ],
  roiProjection: [
    { month: 'Jan', roi: 120, reach: 2800 },
    { month: 'Feb', roi: 145, reach: 3200 },
    { month: 'Mar', roi: 180, reach: 3600 },
    { month: 'Apr', roi: 220, reach: 3800 },
    { month: 'May', roi: 280, reach: 4500 },
    { month: 'Jun', roi: 324, reach: 6000 }
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
    <div className="min-h-screen bg-background">
      {/* Luxury Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-50 luxury-shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 impactlens-gradient rounded-2xl flex items-center justify-center luxury-shadow">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold impactlens-text-gradient">
                  ImpactLens
                </h1>
                <p className="text-sm text-muted-foreground font-medium">Partnership Intelligence Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge 
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 px-3 py-1"
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
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px] bg-card shadow-sm border border-border">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Dashboard</TabsTrigger>
            <TabsTrigger value="scenarios" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Scenarios</TabsTrigger>
            <TabsTrigger value="partners" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Partners</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Reports</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card luxury-shadow hover-lift border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Partnership ROI</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{dashboardData.stats.partnership_roi}%</p>
                      <p className="text-sm text-green-600 font-medium mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        12.5% vs last quarter
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card luxury-shadow hover-lift border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Brand Reach</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{dashboardData.stats.brand_reach}M</p>
                      <p className="text-sm text-green-600 font-medium mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        18.2% vs last quarter
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card luxury-shadow hover-lift border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Audience Growth</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{dashboardData.stats.audience_growth}K</p>
                      <p className="text-sm text-green-600 font-medium mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        8.7% vs last quarter
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card luxury-shadow hover-lift border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Sales Impact</p>
                      <p className="text-3xl font-bold text-foreground mt-2">${dashboardData.stats.sales_impact}M</p>
                      <p className="text-sm text-red-600 font-medium mt-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                        3.1% vs last quarter
                      </p>
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
              <Card className="bg-card luxury-shadow border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                    <div className="w-8 h-8 impactlens-gradient rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-primary-foreground" />
                    </div>
                    Partnership Performance
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Key metrics across partnership dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={dashboardData.performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 85)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="oklch(0.45 0.01 85)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.45 0.01 85)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'oklch(1 0 0)', 
                          border: '1px solid oklch(0.92 0.01 85)', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                      <Bar dataKey="value" fill="oklch(0.55 0.15 85)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card luxury-shadow border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                    <div className="w-8 h-8 impactlens-gradient rounded-lg flex items-center justify-center">
                      <PieChartIcon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    Audience Breakdown
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Target audience composition analysis</CardDescription>
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
                        stroke="oklch(1 0 0)"
                        strokeWidth={2}
                      >
                        {dashboardData.audienceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'oklch(1 0 0)', 
                          border: '1px solid oklch(0.92 0.01 85)', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {dashboardData.audienceBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="font-medium text-foreground">{item.name}</span>
                        </div>
                        <span className="font-bold text-foreground">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ROI Projection */}
            <Card className="bg-card luxury-shadow border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                  <div className="w-8 h-8 impactlens-gradient rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-primary-foreground" />
                  </div>
                  ROI Projection & Reach Growth
                </CardTitle>
                <CardDescription className="text-muted-foreground">6-month partnership performance trajectory</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={dashboardData.roiProjection} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 85)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.45 0.01 85)" />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="oklch(0.45 0.01 85)" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="oklch(0.45 0.01 85)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(1 0 0)', 
                        border: '1px solid oklch(0.92 0.01 85)', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="roi" 
                      stroke="oklch(0.55 0.15 85)" 
                      strokeWidth={3}
                      dot={{ fill: 'oklch(0.55 0.15 85)', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: 'oklch(0.55 0.15 85)', strokeWidth: 2 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="reach" 
                      stroke="oklch(0.45 0.18 85)" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ fill: 'oklch(0.45 0.18 85)', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: 'oklch(0.45 0.18 85)', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Create Scenario Form */}
              <Card className="bg-card luxury-shadow border-0">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                    <div className="w-8 h-8 impactlens-gradient rounded-lg flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    Partnership Scenario Builder
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Create and analyze new partnership opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brandA" className="text-sm font-semibold text-foreground">Brand A</Label>
                        <Input
                          id="brandA"
                          placeholder="Enter first brand name"
                          value={formData.brandA}
                          onChange={(e) => setFormData(prev => ({ ...prev, brandA: e.target.value }))}
                          className="border-border focus:border-primary focus:ring-primary"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brandB" className="text-sm font-semibold text-foreground">Brand B</Label>
                        <Input
                          id="brandB"
                          placeholder="Enter second brand name"
                          value={formData.brandB}
                          onChange={(e) => setFormData(prev => ({ ...prev, brandB: e.target.value }))}
                          className="border-border focus:border-primary focus:ring-primary"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partnershipType" className="text-sm font-semibold text-foreground">Partnership Type</Label>
                      <Select value={formData.partnershipType} onValueChange={(value) => setFormData(prev => ({ ...prev, partnershipType: value }))}>
                        <SelectTrigger className="border-border focus:border-primary focus:ring-primary">
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
                      <Label htmlFor="targetAudience" className="text-sm font-semibold text-foreground">Target Audience</Label>
                      <Input
                        id="targetAudience"
                        placeholder="Describe target audience"
                        value={formData.targetAudience}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                        className="border-border focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budgetRange" className="text-sm font-semibold text-foreground">Budget Range</Label>
                      <Select value={formData.budgetRange} onValueChange={(value) => setFormData(prev => ({ ...prev, budgetRange: value }))}>
                        <SelectTrigger className="border-border focus:border-primary focus:ring-primary">
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
                      className="w-full impactlens-gradient hover:opacity-90 text-primary-foreground font-semibold py-3 luxury-shadow"
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
                          Start AI Analysis
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <Card className="bg-card luxury-shadow border-0">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-bold text-foreground">Analysis Results</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {scenarios.length > 0 ? 'AI-powered partnership insights' : 'Results will appear here after analysis'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {scenarios.length > 0 ? (
                    <div className="space-y-6">
                      {scenarios.map((scenario) => (
                        <div key={scenario.id} className="border border-border rounded-xl p-6 bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-foreground">{scenario.brand_a} × {scenario.brand_b}</h3>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {scenario.partnership_type}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-4 bg-card rounded-lg luxury-shadow">
                              <div className="text-2xl font-bold text-primary">{scenario.analysis_results.brand_alignment_score}/10</div>
                              <div className="text-sm text-muted-foreground font-medium">Brand Alignment</div>
                            </div>
                            <div className="text-center p-4 bg-card rounded-lg luxury-shadow">
                              <div className="text-2xl font-bold text-primary">{scenario.analysis_results.audience_overlap_percentage}%</div>
                              <div className="text-sm text-muted-foreground font-medium">Audience Overlap</div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button variant="outline" size="sm" className="flex-1 border-border hover:bg-muted">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 border-border hover:bg-muted">
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 impactlens-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Ready for Analysis</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        Fill in the partnership details and click "Analyze Partnership" to get AI-powered insights.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="animate-fade-in">
            <Card className="bg-card luxury-shadow border-0">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-bold text-foreground">Partner Directory</CardTitle>
                <CardDescription className="text-muted-foreground">Manage and discover potential partnership opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="w-16 h-16 impactlens-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Partner Directory</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Partner management features coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="animate-fade-in">
            <Card className="bg-card luxury-shadow border-0">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-bold text-foreground">Analytics Reports</CardTitle>
                <CardDescription className="text-muted-foreground">Comprehensive partnership performance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="w-16 h-16 impactlens-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Advanced Reports</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
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
