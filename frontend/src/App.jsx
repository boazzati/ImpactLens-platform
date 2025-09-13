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
import { TrendingUp, Users, Target, DollarSign, Sparkles, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Download, Share2, Settings, Bell, User, LogOut } from 'lucide-react'
import impactLensLogo from './assets/impactlens-logojustsymbol.png'
import './App.css'

// Sample data for charts
const performanceData = [
  { name: 'Brand Alignment', value: 87, color: '#D4AF37' },
  { name: 'Audience Overlap', value: 73, color: '#B8941F' },
  { name: 'Market Synergy', value: 91, color: '#E6C547' },
  { name: 'Risk Assessment', value: 82, color: '#C5A632' }
]

const roiProjection = [
  { month: 'Jan', roi: 120, reach: 2400 },
  { month: 'Feb', roi: 145, reach: 2800 },
  { month: 'Mar', roi: 180, reach: 3200 },
  { month: 'Apr', roi: 220, reach: 3800 },
  { month: 'May', roi: 285, reach: 4200 },
  { month: 'Jun', roi: 324, reach: 4600 }
]

const audienceBreakdown = [
  { name: 'Luxury Enthusiasts', value: 35, color: '#D4AF37' },
  { name: 'High-Net-Worth', value: 28, color: '#B8941F' },
  { name: 'Brand Loyalists', value: 22, color: '#E6C547' },
  { name: 'Aspirational', value: 15, color: '#C5A632' }
]

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [analysisError, setAnalysisError] = useState(null)
  const [currentJobId, setCurrentJobId] = useState(null)
  const [scenarioData, setScenarioData] = useState({
    brandA: '',
    brandB: '',
    partnershipType: '',
    targetAudience: '',
    budget: ''
  })

  // API base URL - will be updated with your Heroku URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://impactlens-platform.herokuapp.com'


  // Poll for job status when analyzing
  useEffect(() => {
    if (isAnalyzing && currentJobId) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/jobs/${currentJobId}`)
          
          if (response.ok) {
            const jobStatus = await response.json()
            setAnalysisProgress(jobStatus.progress || 0)
            
            if (jobStatus.status === 'completed' && jobStatus.analysis) {
              setAnalysisResults(jobStatus.analysis)
              setIsAnalyzing(false)
              setAnalysisProgress(100)
            } else if (jobStatus.status === 'failed') {
              setAnalysisError(jobStatus.error || 'Analysis failed')
              setIsAnalyzing(false)
              setAnalysisProgress(0)
            }
          }
        } catch (error) {
          console.error('Error polling job status:', error)
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [isAnalyzing, currentJobId, API_BASE_URL])

  const startAnalysis = async () => {
    if (!scenarioData.brandA || !scenarioData.brandB || !scenarioData.partnershipType) {
      alert('Please fill in all required fields')
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisResults(null)
    setAnalysisError(null)
    setCurrentJobId(null)

    try {
      // Create scenario (no authentication needed for demo)
      const scenarioResponse = await fetch(`${API_BASE_URL}/api/scenarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brand_a: scenarioData.brandA,
          brand_b: scenarioData.brandB,
          partnership_type: scenarioData.partnershipType,
          target_audience: scenarioData.targetAudience,
          budget_range: scenarioData.budget
        })
      })

      if (!scenarioResponse.ok) {
        throw new Error('Failed to create scenario')
      }

      const scenario = await scenarioResponse.json()

      // Start analysis
      const analysisResponse = await fetch(`${API_BASE_URL}/api/scenarios/${scenario.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!analysisResponse.ok) {
        throw new Error('Failed to start analysis')
      }

      const analysisJob = await analysisResponse.json()
      setCurrentJobId(analysisJob.job_id)

    } catch (error) {
      console.error('Analysis failed:', error)
      setAnalysisError(error.message)
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const handleInputChange = (field, value) => {
    setScenarioData(prev => ({ ...prev, [field]: value }))
  }

  const formatRiskLevel = (riskLevel) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600', 
      high: 'text-red-600'
    }
    return colors[riskLevel?.toLowerCase()] || 'text-gray-600'
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
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="luxury-shadow hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Partnership ROI</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold impactlens-text-gradient">324%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">↑ 12.5%</span> vs last quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="luxury-shadow hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Brand Reach</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold impactlens-text-gradient">2.4M</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">↑ 18.2%</span> vs last quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="luxury-shadow hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Audience Growth</CardTitle>
                  <Target className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold impactlens-text-gradient">156K</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">↑ 8.7%</span> vs last quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="luxury-shadow hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sales Impact</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold impactlens-text-gradient">$1.2M</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-600">↓ 3.1%</span> vs last quarter
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Partnership Performance
                  </CardTitle>
                  <CardDescription>Key metrics across partnership dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    Audience Breakdown
                  </CardTitle>
                  <CardDescription>Target audience composition analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={audienceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {audienceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {audienceBreakdown.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <div 
                          className="w-2 h-2 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}: {item.value}%
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ROI Projection */}
            <Card className="luxury-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-primary" />
                  ROI Projection & Reach Growth
                </CardTitle>
                <CardDescription>6-month partnership performance forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={roiProjection}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="roi" 
                      stroke="#D4AF37" 
                      strokeWidth={3}
                      dot={{ fill: '#D4AF37', strokeWidth: 2, r: 6 }}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="reach" 
                      stroke="#B8941F" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ fill: '#B8941F', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Scenario Builder */}
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Partnership Scenario Builder
                  </CardTitle>
                  <CardDescription>Create and analyze new partnership opportunities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brandA">Brand A</Label>
                      <Input 
                        id="brandA"
                        placeholder="Enter first brand name"
                        value={scenarioData.brandA}
                        onChange={(e) => handleInputChange('brandA', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brandB">Brand B</Label>
                      <Input 
                        id="brandB"
                        placeholder="Enter second brand name"
                        value={scenarioData.brandB}
                        onChange={(e) => handleInputChange('brandB', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partnershipType">Partnership Type</Label>
                    <Select value={scenarioData.partnershipType} onValueChange={(value) => handleInputChange('partnershipType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select partnership type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="co-branding">Co-Branding</SelectItem>
                        <SelectItem value="sponsorship">Sponsorship</SelectItem>
                        <SelectItem value="collaboration">Product Collaboration</SelectItem>
                        <SelectItem value="event">Event Partnership</SelectItem>
                        <SelectItem value="licensing">Licensing Agreement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input 
                      id="targetAudience"
                      placeholder="Describe target audience"
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
                        <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                        <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                        <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                        <SelectItem value="5m+">$5M+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isAnalyzing && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Analysis Progress</Label>
                        <span className="text-sm text-muted-foreground">{Math.round(analysisProgress)}%</span>
                      </div>
                      <Progress value={analysisProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground">AI is analyzing partnership potential...</p>
                    </div>
                  )}

                  {analysisError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">Error: {analysisError}</p>
                    </div>
                  )}

                  <Button 
                    onClick={startAnalysis} 
                    disabled={isAnalyzing || !scenarioData.brandA || !scenarioData.brandB || !scenarioData.partnershipType}
                    className="w-full impactlens-gradient hover:opacity-90 transition-opacity"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}
                  </Button>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              {analysisResults && (
                <Card className="luxury-shadow animate-slide-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Analysis Results
                    </CardTitle>
                    <CardDescription>AI-powered partnership insights</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {analysisResults.brand_alignment_score?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">Brand Alignment</div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {analysisResults.audience_overlap_percentage?.toFixed(0) || 'N/A'}%
                        </div>
                        <div className="text-sm text-muted-foreground">Audience Overlap</div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {analysisResults.roi_projection?.toFixed(0) || 'N/A'}%
                        </div>
                        <div className="text-sm text-muted-foreground">ROI Projection</div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className={`text-2xl font-bold ${formatRiskLevel(analysisResults.risk_level)}`}>
                          {analysisResults.risk_level?.charAt(0).toUpperCase() + analysisResults.risk_level?.slice(1) || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">Risk Level</div>
                      </div>
                    </div>

                    {analysisResults.recommendations && analysisResults.recommendations.length > 0 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Recommendations</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          {analysisResults.recommendations.map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResults.key_risks && analysisResults.key_risks.length > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">Key Risks</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {analysisResults.key_risks.map((risk, index) => (
                            <li key={index}>• {risk}</li>
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
                  </CardContent>
                </Card>
              )}
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
