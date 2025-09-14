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

// Sample data for charts with professional gold colors
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

  // Simulate analysis progress
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            setIsAnalyzing(false)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 500)
      return () => clearInterval(interval)
    }
  }, [isAnalyzing])

  const startAnalysis = () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
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
            <div className="flex items-center space-x-4">
              <img src={impactLensLogo} alt="ImpactLens" className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ImpactLens</h1>
                <p className="text-sm text-gray-600">Partnership Intelligence Platform</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-1">
              <Button 
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('dashboard')}
                className="text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Button>
              <Button 
                variant={activeTab === 'scenarios' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('scenarios')}
                className="text-gray-700 hover:text-gray-900"
              >
                Scenarios
              </Button>
              <Button 
                variant={activeTab === 'partners' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('partners')}
                className="text-gray-700 hover:text-gray-900"
              >
                Partners
              </Button>
              <Button 
                variant={activeTab === 'reports' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('reports')}
                className="text-gray-700 hover:text-gray-900"
              >
                Reports
              </Button>
            </nav>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Partnership ROI</CardTitle>
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">324%</div>
                  <p className="text-xs text-gray-600">
                    <span className="text-green-600">↑ 12.5%</span> vs last quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Brand Reach</CardTitle>
                  <Users className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">2.4M</div>
                  <p className="text-xs text-gray-600">
                    <span className="text-green-600">↑ 18.2%</span> vs last quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Audience Growth</CardTitle>
                  <Target className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">156K</div>
                  <p className="text-xs text-gray-600">
                    <span className="text-green-600">↑ 8.7%</span> vs last quarter
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">Sales Impact</CardTitle>
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">$1.2M</div>
                  <p className="text-xs text-gray-600">
                    <span className="text-red-600">↓ 3.1%</span> vs last quarter
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <BarChart3 className="h-5 w-5 text-amber-600" />
                    Partnership Performance
                  </CardTitle>
                  <CardDescription className="text-gray-600">Key metrics across partnership dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
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

              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <PieChartIcon className="h-5 w-5 text-amber-600" />
                    Audience Breakdown
                  </CardTitle>
                  <CardDescription className="text-gray-600">Target audience composition analysis</CardDescription>
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
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {audienceBreakdown.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-gray-300">
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
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <LineChartIcon className="h-5 w-5 text-amber-600" />
                  ROI Projection & Reach Growth
                </CardTitle>
                <CardDescription className="text-gray-600">6-month partnership performance forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={roiProjection}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#6b7280' }} />
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
          </div>
        )}

        {/* Scenarios Tab */}
        {activeTab === 'scenarios' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Scenario Builder */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                    Partnership Scenario Builder
                  </CardTitle>
                  <CardDescription className="text-gray-600">Create and analyze new partnership opportunities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem value="co-branding">Co-Branding</SelectItem>
                        <SelectItem value="sponsorship">Sponsorship</SelectItem>
                        <SelectItem value="collaboration">Product Collaboration</SelectItem>
                        <SelectItem value="event">Event Partnership</SelectItem>
                        <SelectItem value="licensing">Licensing Agreement</SelectItem>
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
                  {!isAnalyzing && analysisProgress === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Ready for Analysis</p>
                      <p className="text-sm">Fill out the form and click "Start AI Analysis" to begin</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-600">
                        <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p>Analyzing partnership potential...</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <div className="space-y-8 animate-fade-in">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Partner Directory</CardTitle>
                <CardDescription className="text-gray-600">Manage and explore potential partnerships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Partner Directory</p>
                  <p className="text-sm">Coming soon - Comprehensive partner management</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-fade-in">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Reports & Analytics</CardTitle>
                <CardDescription className="text-gray-600">Comprehensive partnership performance reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Advanced Reports</p>
                  <p className="text-sm">Coming soon - Detailed analytics and reporting</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
