import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, Users, Target, DollarSign, Sparkles, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Download, Share2, Settings, Bell, User, LogOut, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import impactLensLogo from './assets/impactlens-logojustsymbol.png'
import { useAuth, useDashboardStats, useScenarios, useJobStatus, useScenarioAnalysis } from './hooks/useApi'
import apiService from './services/api'
import './App.css'

// Fallback data for when API is not available
const fallbackPerformanceData = [
  { name: 'Brand Alignment', value: 87, color: '#D4AF37' },
  { name: 'Audience Overlap', value: 73, color: '#B8941F' },
  { name: 'Market Synergy', value: 91, color: '#E6C547' },
  { name: 'Risk Assessment', value: 82, color: '#C5A632' }
]

const fallbackRoiProjection = [
  { month: 'Jan', roi: 120, reach: 2400 },
  { month: 'Feb', roi: 145, reach: 2800 },
  { month: 'Mar', roi: 180, reach: 3200 },
  { month: 'Apr', roi: 220, reach: 3800 },
  { month: 'May', roi: 285, reach: 4200 },
  { month: 'Jun', roi: 324, reach: 4600 }
]

const fallbackAudienceBreakdown = [
  { name: 'Luxury Enthusiasts', value: 35, color: '#D4AF37' },
  { name: 'High-Net-Worth', value: 28, color: '#B8941F' },
  { name: 'Brand Loyalists', value: 22, color: '#E6C547' },
  { name: 'Aspirational', value: 15, color: '#C5A632' }
]

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [scenarioData, setScenarioData] = useState({
    brandA: '',
    brandB: '',
    partnershipType: '',
    targetAudience: '',
    budget: ''
  })

  // API hooks
  const { isAuthenticated, login, loading: authLoading } = useAuth()
  const { data: dashboardStats, loading: statsLoading, error: statsError } = useDashboardStats()
  const { data: scenarios, loading: scenariosLoading, refetch: refetchScenarios } = useScenarios()
  const { createAndAnalyze, currentJob, clearJob, loading: analysisLoading } = useScenarioAnalysis()
  const { jobStatus, loading: jobLoading } = useJobStatus(currentJob?.job_id)

  // Local state for analysis results
  const [analysisResults, setAnalysisResults] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Auto-login on mount if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      login().catch(console.error)
    }
  }, [isAuthenticated, authLoading, login])

  // Handle job status updates
  useEffect(() => {
    if (jobStatus) {
      if (jobStatus.status === 'completed' && jobStatus.analysis) {
        setAnalysisResults(jobStatus.analysis)
        setIsAnalyzing(false)
        clearJob()
      } else if (jobStatus.status === 'failed') {
        setIsAnalyzing(false)
        clearJob()
      } else if (jobStatus.status === 'processing') {
        setIsAnalyzing(true)
      }
    }
  }, [jobStatus, clearJob])

  const handleInputChange = (field, value) => {
    setScenarioData(prev => ({ ...prev, [field]: value }))
  }

  const startAnalysis = async () => {
    if (!scenarioData.brandA || !scenarioData.brandB || !scenarioData.partnershipType) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsAnalyzing(true)
      setAnalysisResults(null)
      await createAndAnalyze(scenarioData)
      refetchScenarios()
    } catch (error) {
      console.error('Analysis failed:', error)
      setIsAnalyzing(false)
      alert('Analysis failed: ' + error.message)
    }
  }

  // Prepare chart data from API or fallback
  const performanceData = analysisResults ? [
    { name: 'Brand Alignment', value: analysisResults.brand_alignment_score * 10, color: '#D4AF37' },
    { name: 'Audience Overlap', value: analysisResults.audience_overlap_percentage, color: '#B8941F' },
    { name: 'Market Synergy', value: 85, color: '#E6C547' }, // Calculated metric
    { name: 'Risk Assessment', value: analysisResults.risk_level === 'low' ? 90 : analysisResults.risk_level === 'medium' ? 70 : 40, color: '#C5A632' }
  ] : fallbackPerformanceData

  // Generate ROI projection from analysis or use fallback
  const roiProjection = analysisResults ? 
    Array.from({ length: 6 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
      roi: Math.round(analysisResults.roi_projection * (1 + i * 0.1)),
      reach: 2400 + (i * 400)
    })) : fallbackRoiProjection

  const audienceBreakdown = fallbackAudienceBreakdown // Keep static for now

  // Dashboard stats with API data or fallback
  const displayStats = dashboardStats || {
    total_scenarios: 0,
    completed_analyses: 0,
    avg_roi_projection: 0,
    avg_brand_alignment: 0,
    avg_audience_overlap: 0
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Connecting to ImpactLens...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={impactLensLogo} alt="ImpactLens" className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold impactlens-text-gradient">ImpactLens</h1>
                <p className="text-sm text-muted-foreground">Partnership Intelligence Platform</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" onClick={() => setActiveTab('dashboard')}>Dashboard</Button>
              <Button variant="ghost" onClick={() => setActiveTab('scenarios')}>Scenarios</Button>
              <Button variant="ghost" onClick={() => setActiveTab('partners')}>Partners</Button>
              <Button variant="ghost" onClick={() => setActiveTab('reports')}>Reports</Button>
            </nav>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><User className="h-4 w-4" /></Button>
              {statsError && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  API Error
                </Badge>
              )}
              {!statsError && isAuthenticated && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 luxury-shadow">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Scenarios
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Partners
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="luxury-shadow hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Scenarios</p>
                      <p className="text-3xl font-bold impactlens-text-gradient">
                        {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : displayStats.total_scenarios}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="luxury-shadow hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed Analyses</p>
                      <p className="text-3xl font-bold impactlens-text-gradient">
                        {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : displayStats.completed_analyses}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="luxury-shadow hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg ROI Projection</p>
                      <p className="text-3xl font-bold impactlens-text-gradient">
                        {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${displayStats.avg_roi_projection}%`}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="luxury-shadow hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Brand Alignment</p>
                      <p className="text-3xl font-bold impactlens-text-gradient">
                        {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${displayStats.avg_brand_alignment}/10`}
                      </p>
                    </div>
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    {analysisResults ? 'Latest analysis results' : 'Sample partnership analysis'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#D4AF37" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* ROI Projection */}
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5" />
                    ROI Projection
                  </CardTitle>
                  <CardDescription>
                    {analysisResults ? 'Projected returns based on analysis' : 'Sample ROI projection'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={roiProjection}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="roi" stroke="#D4AF37" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Scenarios */}
            <Card className="luxury-shadow">
              <CardHeader>
                <CardTitle>Recent Scenarios</CardTitle>
                <CardDescription>Your latest partnership analyses</CardDescription>
              </CardHeader>
              <CardContent>
                {scenariosLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading scenarios...
                  </div>
                ) : scenarios && scenarios.length > 0 ? (
                  <div className="space-y-4">
                    {scenarios.slice(0, 5).map((scenario) => (
                      <div key={scenario.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{scenario.brand_a} × {scenario.brand_b}</h4>
                          <p className="text-sm text-muted-foreground">{scenario.partnership_type}</p>
                        </div>
                        <Badge variant={scenario.status === 'completed' ? 'default' : 'secondary'}>
                          {scenario.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No scenarios yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first partnership scenario to get started.
                    </p>
                    <Button onClick={() => setActiveTab('scenarios')}>
                      Create Scenario
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scenario Creation */}
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle>Create Partnership Scenario</CardTitle>
                  <CardDescription>Define your partnership parameters for AI analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brandA">Brand A *</Label>
                      <Input
                        id="brandA"
                        placeholder="e.g., Louis Vuitton"
                        value={scenarioData.brandA}
                        onChange={(e) => handleInputChange('brandA', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brandB">Brand B *</Label>
                      <Input
                        id="brandB"
                        placeholder="e.g., Tesla"
                        value={scenarioData.brandB}
                        onChange={(e) => handleInputChange('brandB', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partnershipType">Partnership Type *</Label>
                    <Select value={scenarioData.partnershipType} onValueChange={(value) => handleInputChange('partnershipType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select partnership type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="co-branding">Co-branding</SelectItem>
                        <SelectItem value="sponsorship">Sponsorship</SelectItem>
                        <SelectItem value="collaboration">Product Collaboration</SelectItem>
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
                      value={scenarioData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select value={scenarioData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
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
                    onClick={startAnalysis} 
                    className="w-full luxury-gradient" 
                    disabled={isAnalyzing || analysisLoading}
                  >
                    {isAnalyzing || analysisLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Partnership...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze Partnership
                      </>
                    )}
                  </Button>

                  {(isAnalyzing || jobLoading) && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Analysis Progress</span>
                        <span>{jobStatus?.progress || 0}%</span>
                      </div>
                      <Progress value={jobStatus?.progress || 0} className="w-full" />
                      <p className="text-xs text-muted-foreground">
                        {jobStatus?.status === 'processing' ? 'AI is analyzing your partnership scenario...' : 'Initializing analysis...'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    {analysisResults ? 'AI-powered partnership insights' : 'Results will appear here after analysis'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResults ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-primary/5 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{analysisResults.brand_alignment_score}/10</div>
                          <div className="text-sm text-muted-foreground">Brand Alignment</div>
                        </div>
                        <div className="text-center p-4 bg-primary/5 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{analysisResults.audience_overlap_percentage}%</div>
                          <div className="text-sm text-muted-foreground">Audience Overlap</div>
                        </div>
                        <div className="text-center p-4 bg-primary/5 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{analysisResults.roi_projection}%</div>
                          <div className="text-sm text-muted-foreground">ROI Projection</div>
                        </div>
                        <div className="text-center p-4 bg-primary/5 rounded-lg">
                          <div className={`text-2xl font-bold ${
                            analysisResults.risk_level === 'low' ? 'text-green-600' : 
                            analysisResults.risk_level === 'medium' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {analysisResults.risk_level.charAt(0).toUpperCase() + analysisResults.risk_level.slice(1)}
                          </div>
                          <div className="text-sm text-muted-foreground">Risk Level</div>
                        </div>
                      </div>

                      {analysisResults.recommendations && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">Key Recommendations</h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            {JSON.parse(analysisResults.recommendations).map((rec, index) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Export Report
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Analysis
                        </Button>
                      </div>
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
          <TabsContent value="partners" className="animate-fade-in">
            <Card className="luxury-shadow">
              <CardHeader>
                <CardTitle>Partner Directory</CardTitle>
                <CardDescription>Discover and manage partnership opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Partner Discovery Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Advanced partner matching and discovery features will be available in the next release.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="animate-fade-in">
            <Card className="luxury-shadow">
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Generate comprehensive partnership reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Reporting Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed reporting and export capabilities will be available in the next release.
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
