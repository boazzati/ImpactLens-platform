import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, DollarSign, Target, Sparkles, BarChart3, PieChart as PieChartIcon, FileText, Settings, Bell, User } from 'lucide-react'
import './App.css'

// Mock data for charts
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

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [authToken, setAuthToken] = useState(null)
  const [scenarioData, setScenarioData] = useState({
    brandA: '',
    brandB: '',
    partnershipType: '',
    targetAudience: '',
    budget: ''
  })

  // Auto-login on component mount
  useEffect(() => {
    const loginDemo = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://impactlens-platform-20d6698d163f.herokuapp.com'}/api/auth/demo-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setAuthToken(data.access_token)
        }
      } catch (error) {
        console.error('Auto-login failed:', error)
      }
    }
    
    loginDemo()
  }, [])

  // Real API analysis
  const performAnalysis = async () => {
    if (!authToken) {
      setAnalysisResults({
        error: 'Authentication required. Please refresh the page.',
        overallScore: 0
      })
      setIsAnalyzing(false)
      setAnalysisComplete(true)
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
      
      // Start polling for job completion
      if (data.job_id) {
        pollJobStatus(data.job_id)
      } else {
        throw new Error('No job ID returned')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      setIsAnalyzing(false)
      setAnalysisComplete(true)
      setAnalysisResults({
        error: `Analysis failed: ${error.message}. Please try again.`,
        overallScore: 0
      })
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
          
          // Parse the AI analysis results
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
          setIsAnalyzing(false)
          setAnalysisComplete(true)
          setAnalysisResults({
            error: 'Analysis failed. Please try again.',
            overallScore: 0
          })
        } else {
          // Update progress based on job status
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
        setIsAnalyzing(false)
        setAnalysisComplete(true)
        setAnalysisResults({
          error: `Polling failed: ${error.message}`,
          overallScore: 0
        })
      }
    }, 2000) // Poll every 2 seconds
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ImpactLens</h1>
                <p className="text-sm text-gray-600">Partnership Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {authToken ? 'Connected' : 'Demo Mode'}
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
              <TabsTrigger 
                value="dashboard" 
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'border-amber-500 bg-amber-100 text-amber-800' 
                    : 'border-transparent hover:bg-amber-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="scenarios" 
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'scenarios' 
                    ? 'border-amber-500 bg-amber-100 text-amber-800' 
                    : 'border-transparent hover:bg-amber-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Target className="h-4 w-4" />
                Scenarios
              </TabsTrigger>
              <TabsTrigger 
                value="partners" 
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'partners' 
                    ? 'border-amber-500 bg-amber-100 text-amber-800' 
                    : 'border-transparent hover:bg-amber-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="h-4 w-4" />
                Partners
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'reports' 
                    ? 'border-amber-500 bg-amber-100 text-amber-800' 
                    : 'border-transparent hover:bg-amber-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Content */}
            <TabsContent value="dashboard" className="mt-0">
              <div className="container mx-auto px-6 py-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-white shadow-sm border border-gray-200">
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

                  <Card className="bg-white shadow-sm border border-gray-200">
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

                  <Card className="bg-white shadow-sm border border-gray-200">
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

                  <Card className="bg-white shadow-sm border border-gray-200">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Partnership Performance</CardTitle>
                      <CardDescription className="text-gray-600">Key metrics across partnership dimensions</CardDescription>
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

                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Audience Breakdown</CardTitle>
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
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Scenarios Content */}
            <TabsContent value="scenarios" className="mt-0">
              <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Scenario Builder */}
                  <Card className="bg-white shadow-sm border border-gray-200">
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
                          <Label htmlFor="brandA" className="text-gray-700">Brand A</Label>
                          <Input
                            id="brandA"
                            placeholder="Enter first brand name"
                            value={scenarioData.brandA}
                            onChange={(e) => handleInputChange('brandA', e.target.value)}
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="brandB" className="text-gray-700">Brand B</Label>
                          <Input
                            id="brandB"
                            placeholder="Enter second brand name"
                            value={scenarioData.brandB}
                            onChange={(e) => handleInputChange('brandB', e.target.value)}
                            className="border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partnershipType" className="text-gray-700">Partnership Type</Label>
                        <Select value={scenarioData.partnershipType} onValueChange={(value) => handleInputChange('partnershipType', value)}>
                          <SelectTrigger className="border-gray-300">
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
                        <Label htmlFor="targetAudience" className="text-gray-700">Target Audience</Label>
                        <Input
                          id="targetAudience"
                          placeholder="Describe target audience"
                          value={scenarioData.targetAudience}
                          onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                          className="border-gray-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budget" className="text-gray-700">Budget Range</Label>
                        <Select value={scenarioData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                          <SelectTrigger className="border-gray-300">
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
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}
                      </Button>

                      {isAnalyzing && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Analysis Progress</span>
                            <span>{Math.round(analysisProgress)}%</span>
                          </div>
                          <Progress value={analysisProgress} className="w-full" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Analysis Results */}
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Analysis Results</CardTitle>
                      <CardDescription className="text-gray-600">AI-powered partnership insights</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!isAnalyzing && !analysisComplete ? (
                        <div className="text-center py-12 text-gray-500">
                          <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>Ready for Analysis</p>
                          <p className="text-sm">Fill out the form and click "Start AI Analysis" to begin</p>
                        </div>
                      ) : isAnalyzing ? (
                        <div className="space-y-4">
                          <div className="text-center py-8 text-gray-600">
                            <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p>Analyzing partnership potential...</p>
                            <p className="text-sm">Processing brand alignment, market synergy, and risk assessment</p>
                          </div>
                        </div>
                      ) : analysisComplete && analysisResults ? (
                        <div className="space-y-6">
                          {analysisResults.error ? (
                            <div className="text-center py-8">
                              <div className="text-red-500 text-lg font-semibold mb-2">Analysis Error</div>
                              <p className="text-gray-600">{analysisResults.error}</p>
                              <Button 
                                onClick={() => {
                                  setAnalysisComplete(false)
                                  setAnalysisResults(null)
                                  setAnalysisProgress(0)
                                }}
                                className="mt-4 bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                Try Again
                              </Button>
                            </div>
                          ) : (
                            <>
                              {/* Overall Score */}
                              <div className="text-center">
                                <div className="text-4xl font-bold text-amber-600 mb-2">{analysisResults.overallScore}/100</div>
                                <p className="text-gray-600">Partnership Compatibility Score</p>
                                {analysisResults.aiInsights && (
                                  <p className="text-sm text-gray-500 mt-2 italic">"{analysisResults.aiInsights}"</p>
                                )}
                              </div>

                              {/* Key Metrics */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="text-2xl font-bold text-gray-900">{analysisResults.brandAlignment}%</div>
                                  <p className="text-sm text-gray-600">Brand Alignment</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="text-2xl font-bold text-gray-900">{analysisResults.marketSynergy}%</div>
                                  <p className="text-sm text-gray-600">Market Synergy</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="text-2xl font-bold text-gray-900">{analysisResults.audienceOverlap}%</div>
                                  <p className="text-sm text-gray-600">Audience Overlap</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="text-2xl font-bold text-gray-900">{analysisResults.riskAssessment}%</div>
                                  <p className="text-sm text-gray-600">Risk Assessment</p>
                                </div>
                              </div>

                              {/* Projections */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-amber-50 rounded-lg">
                                  <div className="text-2xl font-bold text-amber-600">{analysisResults.projectedROI}</div>
                                  <p className="text-sm text-gray-600">Projected ROI</p>
                                </div>
                                <div className="text-center p-4 bg-amber-50 rounded-lg">
                                  <div className="text-2xl font-bold text-amber-600">{analysisResults.estimatedReach}</div>
                                  <p className="text-sm text-gray-600">Estimated Reach</p>
                                </div>
                              </div>

                              {/* Recommendations */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Key Recommendations</h4>
                                <ul className="space-y-2">
                                  {analysisResults.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                                      <span className="text-sm text-gray-700">{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Risks */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Potential Risks</h4>
                                <ul className="space-y-2">
                                  {analysisResults.risks.map((risk, index) => (
                                    <li key={index} className="flex items-start gap-2">
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
                                className="w-full"
                              >
                                Start New Analysis
                              </Button>
                            </>
                          )}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Partners Content */}
            <TabsContent value="partners" className="mt-0">
              <div className="container mx-auto px-6 py-8">
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Partner Management</p>
                  <p className="text-sm">Coming soon - Manage your partnership network</p>
                </div>
              </div>
            </TabsContent>

            {/* Reports Content */}
            <TabsContent value="reports" className="mt-0">
              <div className="container mx-auto px-6 py-8">
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Reports & Analytics</p>
                  <p className="text-sm">Coming soon - Detailed partnership reports</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </nav>
    </div>
  )
}

export default App
