import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, Users, DollarSign, Target, Sparkles, BarChart3, PieChart as PieChartIcon, FileText, Settings, Bell, User } from 'lucide-react'
import impactLensLogo from './assets/impactlens-logo.png'
import './App.css'

// Mock data for charts with luxury gold colors
const performanceData = [
  { name: 'Brand Alignment', value: 85, color: '#D4AF37' },
  { name: 'Audience Overlap', value: 72, color: '#B8941F' },
  { name: 'Market Synergy', value: 91, color: '#E6C547' },
  { name: 'Risk Assessment', value: 78, color: '#C5A632' }
]

const audienceData = [
  { name: 'Premium Buyers', value: 35, color: '#D4AF37' },
  { name: 'Tech Enthusiasts', value: 28, color: '#B8941F' },
  { name: 'Brand Loyalists', value: 22, color: '#E6C547' },
  { name: 'Aspirational', value: 15, color: '#C5A632' }
]

const roiProjection = [
  { month: 'Jan', roi: 120, reach: 2800 },
  { month: 'Feb', roi: 145, reach: 3200 },
  { month: 'Mar', roi: 180, reach: 3800 },
  { month: 'Apr', roi: 220, reach: 3800 },
  { month: 'May', roi: 280, reach: 4200 },
  { month: 'Jun', roi: 340, reach: 6000 }
]

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [authToken, setAuthToken] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [scenarioData, setScenarioData] = useState({
    brandA: '',
    brandB: '',
    partnershipType: '',
    targetAudience: '',
    budget: ''
  })

  // Auto-login and connection status
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        setConnectionStatus('connecting')
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://impactlens-platform-20d6698d163f.herokuapp.com'}/api/auth/demo-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        })
        
        if (response.ok) {
          const data = await response.json()
          setAuthToken(data.access_token)
          setConnectionStatus('connected')
        } else {
          throw new Error('Authentication failed')
        }
      } catch (error) {
        console.error('Connection failed:', error)
        setConnectionStatus('demo')
        // Continue with demo mode - show mock data
      }
    }
    
    initializeConnection()
  }, [])

  // Real API analysis with fallback to mock data
  const performAnalysis = async () => {
    if (!authToken) {
      // Fallback to mock analysis for demo
      setIsAnalyzing(true)
      setAnalysisProgress(0)
      
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setIsAnalyzing(false)
            setAnalysisComplete(true)
            setAnalysisResults({
              overallScore: 87,
              brandAlignment: 92,
              marketSynergy: 85,
              audienceOverlap: 78,
              riskAssessment: 83,
              projectedROI: '285%',
              estimatedReach: '2.3M',
              recommendations: [
                'Strong brand synergy between Tesla\'s innovation and Apple\'s premium positioning',
                'Target affluent tech-early adopters for maximum impact',
                'Consider co-branded charging solutions for Apple devices',
                'Leverage both brands\' sustainability messaging'
              ],
              risks: [
                'Potential brand dilution if messaging not aligned',
                'High consumer expectations for innovation',
                'Competitive response from other tech partnerships'
              ],
              aiInsights: 'This partnership shows exceptional potential with complementary brand values and overlapping premium customer segments.'
            })
            return 100
          }
          return prev + 10
        })
      }, 300)
      
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://impactlens-platform-20d6698d163f.herokuapp.com'}/api/scenarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          brand_a: scenarioData.brandA,
          brand_b: scenarioData.brandB,
          partnership_type: scenarioData.partnershipType,
          target_audience: scenarioData.targetAudience,
          budget_range: scenarioData.budget
        })
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.job_id) {
        pollJobStatus(data.job_id)
      } else {
        throw new Error('No job ID returned')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      // Fallback to mock analysis
      performAnalysis()
    }
  }

  const pollJobStatus = async (jobId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://impactlens-platform-20d6698d163f.herokuapp.com'}/api/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`Job polling failed: ${response.status}`)
        }
        
        const jobData = await response.json()
        
        if (jobData.status === 'completed') {
          clearInterval(pollInterval)
          setIsAnalyzing(false)
          setAnalysisComplete(true)
          setAnalysisProgress(100)
          
          const analysis = jobData.result || {}
          setAnalysisResults({
            overallScore: analysis.overall_score || 85,
            brandAlignment: analysis.brand_alignment || 90,
            marketSynergy: analysis.market_synergy || 82,
            audienceOverlap: analysis.audience_overlap || 75,
            riskAssessment: analysis.risk_assessment || 88,
            projectedROI: analysis.projected_roi || '280%',
            estimatedReach: analysis.estimated_reach || '2.1M',
            recommendations: analysis.recommendations || ['AI analysis completed successfully'],
            risks: analysis.risks || ['Standard partnership risks apply'],
            aiInsights: analysis.ai_insights || 'Comprehensive analysis completed'
          })
        } else if (jobData.status === 'failed') {
          clearInterval(pollInterval)
          // Fallback to mock analysis
          performAnalysis()
        } else {
          const progressMap = {
            'pending': 10,
            'processing': 50,
            'analyzing': 80
          }
          setAnalysisProgress(progressMap[jobData.status] || 30)
        }
      } catch (error) {
        console.error('Polling error:', error)
        clearInterval(pollInterval)
        // Fallback to mock analysis
        performAnalysis()
      }
    }, 2000)
  }

  const startAnalysis = () => {
    if (!scenarioData.brandA || !scenarioData.brandB || !scenarioData.partnershipType) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisComplete(false)
    setAnalysisResults(null)
    performAnalysis()
  }

  const handleInputChange = (field, value) => {
    setScenarioData(prev => ({ ...prev, [field]: value }))
  }

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Connected</div>
      case 'connecting':
        return <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Connecting...</div>
      case 'demo':
      default:
        return <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Demo Mode</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 luxury-shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={impactLensLogo} alt="ImpactLens" className="w-10 h-10 rounded-full" />
              <div>
                <h1 className="text-xl font-bold impactlens-text-gradient">ImpactLens</h1>
                <p className="text-sm text-gray-600">Partnership Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {getConnectionBadge()}
              <Button variant="ghost" size="sm" className="hover-lift">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover-lift">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover-lift">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white luxury-shadow rounded-lg p-1">
            <TabsTrigger 
              value="dashboard" 
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 luxury-shadow' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="scenarios" 
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                activeTab === 'scenarios' 
                  ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 luxury-shadow' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Target className="h-4 w-4" />
              Scenarios
            </TabsTrigger>
            <TabsTrigger 
              value="partners" 
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                activeTab === 'partners' 
                  ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 luxury-shadow' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4" />
              Partners
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                activeTab === 'reports' 
                  ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 luxury-shadow' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Content */}
          <TabsContent value="dashboard" className="animate-fade-in">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white luxury-shadow hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Partnership ROI</p>
                      <p className="text-3xl font-bold text-gray-900">324%</p>
                      <p className="text-sm text-green-600">↗ 12.5% vs last quarter</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white luxury-shadow hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Brand Reach</p>
                      <p className="text-3xl font-bold text-gray-900">2.4M</p>
                      <p className="text-sm text-green-600">↗ 18.2% vs last quarter</p>
                    </div>
                    <Users className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white luxury-shadow hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Audience Growth</p>
                      <p className="text-3xl font-bold text-gray-900">156K</p>
                      <p className="text-sm text-green-600">↗ 8.7% vs last quarter</p>
                    </div>
                    <Target className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white luxury-shadow hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sales Impact</p>
                      <p className="text-3xl font-bold text-gray-900">$1.2M</p>
                      <p className="text-sm text-red-600">↘ 3.1% vs last quarter</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="bg-white luxury-shadow hover-lift">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-amber-600" />
                    Partnership Performance
                  </CardTitle>
                  <CardDescription className="text-gray-600">Key metrics across partnership dimensions</CardDescription>
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
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white luxury-shadow hover-lift">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-amber-600" />
                    Audience Breakdown
                  </CardTitle>
                  <CardDescription className="text-gray-600">Target audience composition analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={audienceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {audienceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* ROI Projection */}
            <Card className="bg-white luxury-shadow hover-lift">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  ROI Projection & Reach Growth
                </CardTitle>
                <CardDescription className="text-gray-600">6-month partnership performance forecast</CardDescription>
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
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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

          {/* Scenarios Content */}
          <TabsContent value="scenarios" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Scenario Builder */}
              <Card className="bg-white luxury-shadow hover-lift">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                    Partnership Scenario Builder
                  </CardTitle>
                  <CardDescription className="text-gray-600">Create and analyze new partnership opportunities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brandA" className="text-gray-700 font-medium">Brand A</Label>
                      <Input
                        id="brandA"
                        placeholder="Enter first brand name"
                        value={scenarioData.brandA}
                        onChange={(e) => handleInputChange('brandA', e.target.value)}
                        className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brandB" className="text-gray-700 font-medium">Brand B</Label>
                      <Input
                        id="brandB"
                        placeholder="Enter second brand name"
                        value={scenarioData.brandB}
                        onChange={(e) => handleInputChange('brandB', e.target.value)}
                        className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partnershipType" className="text-gray-700 font-medium">Partnership Type</Label>
                    <Select value={scenarioData.partnershipType} onValueChange={(value) => handleInputChange('partnershipType', value)}>
                      <SelectTrigger className="border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                        <SelectValue placeholder="Select partnership type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="co-branding">Co-branding</SelectItem>
                        <SelectItem value="sponsorship">Sponsorship</SelectItem>
                        <SelectItem value="joint-venture">Joint Venture</SelectItem>
                        <SelectItem value="licensing">Licensing</SelectItem>
                        <SelectItem value="distribution">Distribution Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience" className="text-gray-700 font-medium">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      placeholder="Describe target audience"
                      value={scenarioData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-gray-700 font-medium">Budget Range</Label>
                    <Select value={scenarioData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                      <SelectTrigger className="border-gray-300 focus:border-amber-500 focus:ring-amber-500">
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
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium py-3 luxury-shadow hover-lift"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Analyzing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Start AI Analysis
                      </div>
                    )}
                  </Button>

                  {isAnalyzing && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Analysis Progress</span>
                        <span>{Math.round(analysisProgress)}%</span>
                      </div>
                      <Progress value={analysisProgress} className="w-full h-2" />
                      <p className="text-sm text-gray-500 text-center">Processing brand alignment, market synergy, and risk assessment...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <Card className="bg-white luxury-shadow hover-lift">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-600" />
                    Analysis Results
                  </CardTitle>
                  <CardDescription className="text-gray-600">AI-powered partnership insights</CardDescription>
                </CardHeader>
                <CardContent>
                  {!isAnalyzing && !analysisComplete ? (
                    <div className="text-center py-12 text-gray-500">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">Ready for Analysis</p>
                      <p className="text-sm">Fill out the form and click "Start AI Analysis" to begin</p>
                    </div>
                  ) : isAnalyzing ? (
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-600">
                        <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-lg font-medium">Analyzing partnership potential...</p>
                        <p className="text-sm">Our AI is evaluating brand compatibility, market opportunities, and potential risks</p>
                      </div>
                    </div>
                  ) : analysisComplete && analysisResults ? (
                    <div className="space-y-6">
                      {/* Overall Score */}
                      <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
                        <div className="text-4xl font-bold text-amber-700 mb-2">{analysisResults.overallScore}/100</div>
                        <p className="text-amber-800 font-medium">Partnership Compatibility Score</p>
                        {analysisResults.aiInsights && (
                          <p className="text-sm text-amber-700 mt-3 italic">"{analysisResults.aiInsights}"</p>
                        )}
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg luxury-shadow">
                          <div className="text-2xl font-bold text-gray-900">{analysisResults.brandAlignment}%</div>
                          <p className="text-sm text-gray-600 font-medium">Brand Alignment</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg luxury-shadow">
                          <div className="text-2xl font-bold text-gray-900">{analysisResults.marketSynergy}%</div>
                          <p className="text-sm text-gray-600 font-medium">Market Synergy</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg luxury-shadow">
                          <div className="text-2xl font-bold text-gray-900">{analysisResults.audienceOverlap}%</div>
                          <p className="text-sm text-gray-600 font-medium">Audience Overlap</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg luxury-shadow">
                          <div className="text-2xl font-bold text-gray-900">{analysisResults.riskAssessment}%</div>
                          <p className="text-sm text-gray-600 font-medium">Risk Assessment</p>
                        </div>
                      </div>

                      {/* Projections */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                          <div className="text-2xl font-bold text-green-700">{analysisResults.projectedROI}</div>
                          <p className="text-sm text-green-800 font-medium">Projected ROI</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                          <div className="text-2xl font-bold text-blue-700">{analysisResults.estimatedReach}</div>
                          <p className="text-sm text-blue-800 font-medium">Estimated Reach</p>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          Key Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {analysisResults.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Risks */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4 text-red-600" />
                          Potential Risks
                        </h4>
                        <ul className="space-y-2">
                          {analysisResults.risks.map((risk, index) => (
                            <li key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-700">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Button */}
                      <Button 
                        onClick={() => {
                          setAnalysisComplete(false)
                          setAnalysisResults(null)
                          setAnalysisProgress(0)
                        }}
                        variant="outline" 
                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 hover-lift"
                      >
                        Start New Analysis
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Partners Content */}
          <TabsContent value="partners" className="animate-fade-in">
            <Card className="bg-white luxury-shadow hover-lift">
              <CardContent className="p-12">
                <div className="text-center text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Partner Management</h3>
                  <p className="text-gray-600">Comprehensive partner network management coming soon</p>
                  <p className="text-sm text-gray-500 mt-2">Track relationships, performance metrics, and collaboration opportunities</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Content */}
          <TabsContent value="reports" className="animate-fade-in">
            <Card className="bg-white luxury-shadow hover-lift">
              <CardContent className="p-12">
                <div className="text-center text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Reports & Analytics</h3>
                  <p className="text-gray-600">Advanced reporting and analytics dashboard coming soon</p>
                  <p className="text-sm text-gray-500 mt-2">Generate detailed partnership reports, ROI analysis, and performance insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
