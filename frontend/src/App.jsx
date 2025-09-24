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
import { TrendingUp, Users, Target, DollarSign, Sparkles, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Download, Share2, Settings, Bell, User, LogOut, AlertCircle, Wifi, WifiOff } from 'lucide-react'
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
  const [scenarioData, setScenarioData] = useState({
    brandA: '',
    brandB: '',
    partnershipType: '',
    targetAudience: '',
    budget: ''
  })
  const [apiStatus, setApiStatus] = useState('disconnected') // 'disconnected', 'connecting', 'connected'
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState(null)
  const [connectionTested, setConnectionTested] = useState(false)

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection()
  }, [])

  const checkBackendConnection = async () => {
    setApiStatus('connecting')
    try {
      // Use CORS proxy for health check
      const response = await fetch('https://cors-anywhere.herokuapp.com/https://impactlens-platform-20d6698d163f.herokuapp.com/api/health')
      if (response.ok) {
        setApiStatus('connected')
      } else {
        setApiStatus('disconnected')
      }
    } catch (error) {
      console.error('Backend connection failed:', error)
      setApiStatus('disconnected')
    }
    setConnectionTested(true)
  }

  const performRealAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);
    setAnalysisResult(null);
    
    const requestData = {
      brand_a: scenarioData.brandA,
      brand_b: scenarioData.brandB,
      partnership_type: scenarioData.partnershipType,
      target_audience: scenarioData.targetAudience || 'Not specified',
      budget_range: scenarioData.budget || 'Not specified'
    };
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      console.log('🚀 Starting analysis with data:', requestData);
      
      // Use CORS proxy to avoid CORS issues
      console.log('🔗 Attempting connection via CORS proxy...');
      const response = await fetch('https://cors-anywhere.herokuapp.com/https://impactlens-platform-20d6698d163f.herokuapp.com/api/test-openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('📡 Response status:', response.status);
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('✅ Analysis successful:', result);
      
      setAnalysisProgress(100);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setAnalysisResult(result);
      
    } catch (error) {
      console.error('💥 Analysis failed:', error);
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setError(error.message);
      
      // Provide user-friendly error message
      let userFriendlyError = error.message;
      if (error.message.includes('Failed to fetch')) {
        userFriendlyError = 'Network connection failed. This is likely a CORS issue. Using demo data.';
      } else if (error.message.includes('405')) {
        userFriendlyError = 'API method not allowed. Check your proxy configuration. Using demo data.';
      }
      setError(userFriendlyError);
      
      // Fallback to realistic demo data
      setTimeout(() => {
        setAnalysisResult({
          status: 'success',
          service_used: 'fallback',
          analysis: {
            brand_alignment_score: Math.floor(Math.random() * 20) + 75, // 75-95
            audience_overlap_percentage: Math.floor(Math.random() * 30) + 60, // 60-90
            roi_projection: Math.floor(Math.random() * 100) + 150, // 150-250
            risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
            key_risks: [
              'Service connectivity issue detected',
              'Using demonstration data',
              'Real AI analysis temporarily unavailable'
            ],
            recommendations: [
              `Partnership between ${scenarioData.brandA} and ${scenarioData.brandB} shows strong potential`,
              'Consider conducting market research to validate assumptions',
              'Re-run analysis when AI service connectivity is restored'
            ],
            market_insights: [
              'Analysis based on demonstration data due to service connectivity',
              'Real-time AI insights will provide more accurate assessment'
            ]
          },
          tokens_used: 0,
          analysis_duration: 2.5
        });
      }, 500);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setScenarioData(prev => ({ ...prev, [field]: value }))
  }

  const retryConnection = () => {
    setConnectionTested(false);
    checkBackendConnection();
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
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                apiStatus === 'connected' ? 'bg-green-100 text-green-800 border border-green-200' : 
                apiStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {apiStatus === 'connected' ? <Wifi className="h-4 w-4 mr-2" /> : 
                 apiStatus === 'connecting' ? <div className="h-4 w-4 mr-2 animate-pulse bg-current rounded-full" /> : 
                 <WifiOff className="h-4 w-4 mr-2" />}
                <span>
                  {apiStatus === 'connected' ? 'Connected' : 
                   apiStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </span>
                {apiStatus === 'disconnected' && connectionTested && (
                  <Button variant="ghost" size="sm" className="ml-2 h-6 text-xs" onClick={retryConnection}>
                    Retry
                  </Button>
                )}
              </div>
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
            {/* Connection Status Banner */}
            {apiStatus === 'disconnected' && connectionTested && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">Backend Connection Issue</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Cannot connect to AI analysis service. Scenario analysis will use demonstration data.
                    </p>
                  </div>
                </div>
              </div>
            )}

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

            {/* Charts and other dashboard content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="luxury-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Partnership Performance
                    </CardTitle>
                    <CardDescription>Key metrics across partnership dimensions</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            borderColor: '#D4AF37',
                            borderRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {performanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="luxury-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-primary" />
                      Audience Breakdown
                    </CardTitle>
                    <CardDescription>Target audience composition analysis</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
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
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            borderColor: '#D4AF37',
                            borderRadius: '4px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }} 
                          formatter={(value) => [`${value}%`, 'Percentage']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {audienceBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="luxury-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-primary" />
                    ROI Projection & Reach Growth
                  </CardTitle>
                  <CardDescription>6-month partnership performance forecast</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={roiProjection} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" stroke="#D4AF37" />
                      <YAxis yAxisId="right" orientation="right" stroke="#B8941F" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          borderColor: '#D4AF37',
                          borderRadius: '4px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Line yAxisId="left" type="monotone" dataKey="roi" stroke="#D4AF37" strokeWidth={2} dot={{ r: 4, fill: '#D4AF37' }} activeDot={{ r: 6 }} />
                      <Line yAxisId="right" type="monotone" dataKey="reach" stroke="#B8941F" strokeWidth={2} dot={{ r: 4, fill: '#B8941F' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
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
                  <CardDescription>
                    Configure partnership parameters for AI analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brandA">Brand A</Label>
                      <Input
                        id="brandA"
                        placeholder="e.g., Tesla"
                        value={scenarioData.brandA}
                        onChange={(e) => handleInputChange('brandA', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brandB">Brand B</Label>
                      <Input
                        id="brandB"
                        placeholder="e.g., SpaceX"
                        value={scenarioData.brandB}
                        onChange={(e) => handleInputChange('brandB', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partnershipType">Partnership Type</Label>
                    <Select
                      value={scenarioData.partnershipType}
                      onValueChange={(value) => handleInputChange('partnershipType', value)}
                    >
                      <SelectTrigger id="partnershipType">
                        <SelectValue placeholder="Select partnership type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="co-branding">Co-branding</SelectItem>
                        <SelectItem value="joint-venture">Joint Venture</SelectItem>
                        <SelectItem value="licensing">Licensing</SelectItem>
                        <SelectItem value="sponsorship">Sponsorship</SelectItem>
                        <SelectItem value="distribution">Distribution Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Select
                      value={scenarioData.targetAudience}
                      onValueChange={(value) => handleInputChange('targetAudience', value)}
                    >
                      <SelectTrigger id="targetAudience">
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="luxury-consumers">Luxury Consumers</SelectItem>
                        <SelectItem value="tech-enthusiasts">Tech Enthusiasts</SelectItem>
                        <SelectItem value="millennials">Millennials</SelectItem>
                        <SelectItem value="gen-z">Gen Z</SelectItem>
                        <SelectItem value="business-professionals">Business Professionals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select
                      value={scenarioData.budget}
                      onValueChange={(value) => handleInputChange('budget', value)}
                    >
                      <SelectTrigger id="budget">
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

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full bg-primary hover:bg-primary/90" 
                    onClick={performRealAnalysis}
                    disabled={isAnalyzing || !scenarioData.brandA || !scenarioData.brandB || !scenarioData.partnershipType}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Analyzing Partnership
                      </>
                    ) : (
                      'Analyze Partnership'
                    )}
                  </Button>

                  {isAnalyzing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Analysis in progress...</span>
                        <span>{analysisProgress}%</span>
                      </div>
                      <Progress value={analysisProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analysis Results */}
              {analysisResult && (
                <Card className="luxury-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Analysis Results
                    </CardTitle>
                    <CardDescription>
                      Partnership analysis for {scenarioData.brandA} × {scenarioData.brandB}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col items-center justify-center">
                        <div className="text-4xl font-bold text-amber-800">
                          {analysisResult.analysis.brand_alignment_score}/10
                        </div>
                        <div className="text-sm text-amber-700 mt-1">Brand Alignment</div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center justify-center">
                        <div className="text-4xl font-bold text-blue-800">
                          {analysisResult.analysis.audience_overlap_percentage}%
                        </div>
                        <div className="text-sm text-blue-700 mt-1">Audience Overlap</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center justify-center">
                        <div className="text-4xl font-bold text-green-800">
                          {analysisResult.analysis.roi_projection}%
                        </div>
                        <div className="text-sm text-green-700 mt-1">ROI Projection</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col items-center justify-center">
                        <div className="text-4xl font-bold text-purple-800">
                          {analysisResult.analysis.risk_level}
                        </div>
                        <div className="text-sm text-purple-700 mt-1">Risk Level</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">Key Risks</h4>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {analysisResult.analysis.key_risks.map((risk, index) => (
                            <li key={index}>{risk}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Recommendation</h4>
                        <p className="text-sm text-green-700">
                          {analysisResult.analysis.recommendations[0]}
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Market Insights</h4>
                        <p className="text-sm text-blue-700">
                          {analysisResult.analysis.market_insights[0]}
                        </p>
                      </div>
                    </div>

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
                    
                    {analysisResult.service_used === 'fallback' && (
                      <div className="text-xs text-muted-foreground p-2 bg-gray-50 rounded">
                        Analysis powered by fallback data. Check backend connection for real AI analysis.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-8 animate-fade-in">
            <Card className="luxury-shadow">
              <CardHeader>
                <CardTitle>Partner Database</CardTitle>
                <CardDescription>
                  Manage and analyze your partnership portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Partner management features coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-8 animate-fade-in">
            <Card className="luxury-shadow">
              <CardHeader>
                <CardTitle>Partnership Reports</CardTitle>
                <CardDescription>
                  Generate comprehensive partnership intelligence reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Reporting features coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App
