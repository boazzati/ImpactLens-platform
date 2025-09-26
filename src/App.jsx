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
import { TrendingUp, Users, Target, DollarSign, Sparkles, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Download, Share2, Settings, Bell, User, LogOut, FileText, Presentation, Mail, MessageSquare, Copy, Link, Code, AlertTriangle, Calendar, Plus } from 'lucide-react'
import impactLensLogo from './assets/impactlens-logojustsymbol.png'
// Temporary placeholder functions instead of missing utils
import './App.css'

// Temporary placeholder functions to replace missing utility files
const exportToPDF = () => ({ success: true, fileName: 'report.pdf' });
const exportToPowerPoint = () => ({ success: true, fileName: 'report.pptx' });

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

  const [analysisResult, setAnalysisResult] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [isExporting, setIsExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  // Placeholder functions for sharing features
  const handleShareEmail = () => alert('Share via Email - Feature coming soon!');
  const handleShareTeams = () => alert('Share via Teams - Feature coming soon!');
  const handleShareWhatsApp = () => alert('Share via WhatsApp - Feature coming soon!');
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };
  const handleGenerateLink = () => alert('Shareable link generated!');
  const handleExportJSON = () => alert('JSON export coming soon!');

  // Test backend connection on load
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        setConnectionStatus('disconnected');
      }
    };
    testConnection();
  }, []);

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

  const startAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisResult(null)

    // Progress simulation
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) return 90; // Stop at 90% until API responds
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      // Prepare request data
      const requestData = {
        brand_a: scenarioData.brandA,
        brand_b: scenarioData.brandB,
        partnership_type: scenarioData.partnershipType,
        target_audience: scenarioData.targetAudience || 'Not specified',
        budget_range: scenarioData.budget || 'Not specified'
      };

      console.log('🚀 Starting analysis with data:', requestData);

      // Call the proxy endpoint
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Analysis result:', result);
      setAnalysisResult(result);

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      // Provide fallback analysis
      setAnalysisResult({
        error: 'API temporarily unavailable',
        service_used: 'fallback',
        analysis: {
          brand_alignment_score: Math.floor(Math.random() * 30) + 70,
          audience_overlap_percentage: Math.floor(Math.random() * 40) + 60,
          roi_projection: Math.floor(Math.random() * 100) + 150,
          risk_level: 'Medium',
          key_risks: ['Service temporarily unavailable', 'Using demo data'],
          recommendations: [
            `Partnership between ${scenarioData.brandA} and ${scenarioData.brandB} shows potential`,
            'Please try again when service is restored'
          ],
          market_insights: ['Analysis based on fallback data due to service issue']
        }
      });
    }
  }

  const handleInputChange = (field, value) => {
    setScenarioData(prev => ({ ...prev, [field]: value }))
  }

  const handleExportPDF = async () => {
    if (!analysisResult) {
      alert('Please run an analysis first before exporting.');
      return;
    }
    
    setIsExporting(true);
    try {
      const result = await exportToPDF(analysisResult, scenarioData);
      if (result.success) {
        alert(`PDF exported successfully as ${result.fileName}`);
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportPowerPoint = async () => {
    if (!analysisResult) {
      alert('Please run an analysis first before exporting.');
      return;
    }
    
    setIsExporting(true);
    try {
      const result = await exportToPowerPoint(analysisResult, scenarioData);
      if (result.success) {
        alert(`PowerPoint exported successfully as ${result.fileName}`);
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

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
                    <Select value={scenarioData.partnershipType || undefined} onValueChange={(value) => handleInputChange('partnershipType', value)}>
                      <SelectTrigger>
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
                    <Select value={scenarioData.targetAudience || undefined} onValueChange={(value) => handleInputChange('targetAudience', value)}>
                      <SelectTrigger>
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
                    <Select value={scenarioData.budget || undefined} onValueChange={(value) => handleInputChange('budget', value)}>
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

                  <Button 
                    onClick={startAnalysis} 
                    disabled={isAnalyzing || !scenarioData.brandA || !scenarioData.brandB}
                    className="w-full impactlens-gradient hover:opacity-90 transition-opacity"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}
                  </Button>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              {analysisResult && (
                <Card className="luxury-shadow animate-slide-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Analysis Results
                      {analysisResult.service_used && (
                        <Badge variant={analysisResult.service_used === 'openai' ? 'default' : 'secondary'}>
                          {analysisResult.service_used === 'openai' ? 'OpenAI' : 'Demo Mode'}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {analysisResult.error ? 'Fallback analysis results' : 'AI-powered partnership insights'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {analysisResult.analysis?.brand_alignment_score || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">Brand Alignment</div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {analysisResult.analysis?.audience_overlap_percentage || 'N/A'}%
                        </div>
                        <div className="text-sm text-muted-foreground">Audience Overlap</div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {analysisResult.analysis?.roi_projection || 'N/A'}%
                        </div>
                        <div className="text-sm text-muted-foreground">ROI Projection</div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className={`text-2xl font-bold ${
                          analysisResult.analysis?.risk_level === 'Low' ? 'text-green-600' :
                          analysisResult.analysis?.risk_level === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {analysisResult.analysis?.risk_level || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">Risk Level</div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {analysisResult.analysis?.recommendations && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Recommendations</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {analysisResult.analysis.recommendations.map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Risks */}
                    {analysisResult.analysis?.key_risks && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">Key Risks</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {analysisResult.analysis.key_risks.map((risk, index) => (
                            <li key={index}>• {risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Market Insights */}
                    {analysisResult.analysis?.market_insights && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Market Insights</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          {analysisResult.analysis.market_insights.map((insight, index) => (
                            <li key={index}>• {insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setShowExportMenu(!showExportMenu)}
                          disabled={isExporting}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {isExporting ? 'Exporting...' : 'Export Report'}
                        </Button>
                        
                        {showExportMenu && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <button
                              onClick={handleExportPDF}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                              disabled={isExporting}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Export as PDF
                            </button>
                            <button
                              onClick={handleExportPowerPoint}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center border-t border-gray-100"
                              disabled={isExporting}
                            >
                              <Presentation className="h-4 w-4 mr-2" />
                              Export as PowerPoint
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="relative flex-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setShowShareMenu(!showShareMenu)}
                          disabled={isSharing}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          {isSharing ? 'Sharing...' : 'Share Analysis'}
                        </Button>
                        
                        {showShareMenu && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <button
                              onClick={handleShareEmail}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                              disabled={isSharing}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Share via Email
                            </button>
                            <button
                              onClick={handleShareTeams}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center border-t border-gray-100"
                              disabled={isSharing}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Share via Teams
                            </button>
                            <button
                              onClick={handleShareWhatsApp}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center border-t border-gray-100"
                              disabled={isSharing}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Share via WhatsApp
                            </button>
                            <button
                              onClick={handleCopyToClipboard}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center border-t border-gray-100"
                              disabled={isSharing}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy to Clipboard
                            </button>
                            <button
                              onClick={handleGenerateLink}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center border-t border-gray-100"
                              disabled={isSharing}
                            >
                              <Link className="h-4 w-4 mr-2" />
                              Generate Link
                            </button>
                            <button
                              onClick={handleExportJSON}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center border-t border-gray-100"
                              disabled={isSharing}
                            >
                              <Code className="h-4 w-4 mr-2" />
                              Export as JSON
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-8 animate-fade-in">
            {/* Partner Search and Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Partner Discovery
                  </CardTitle>
                  <CardDescription>Find and connect with potential partnership opportunities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Input 
                      placeholder="Search partners by name, industry, or location..." 
                      className="flex-1"
                    />
                    <Button>
                      <Users className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="automotive">Automotive</SelectItem>
                        <SelectItem value="energy">Energy</SelectItem>
                        <SelectItem value="luxury">Luxury Goods</SelectItem>
                        <SelectItem value="aerospace">Aerospace</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="europe">Europe</SelectItem>
                        <SelectItem value="north-america">North America</SelectItem>
                        <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                        <SelectItem value="middle-east">Middle East</SelectItem>
                        <SelectItem value="africa">Africa</SelectItem>
                        <SelectItem value="latin-america">Latin America</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Company Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup (1-50)</SelectItem>
                        <SelectItem value="small">Small (51-200)</SelectItem>
                        <SelectItem value="medium">Medium (201-1000)</SelectItem>
                        <SelectItem value="large">Large (1000+)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (10000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="text-sm">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">2,847</div>
                    <div className="text-xs text-muted-foreground">Total Partners</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">156</div>
                    <div className="text-xs text-muted-foreground">Active Partnerships</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">43</div>
                    <div className="text-xs text-muted-foreground">Pending Proposals</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Partner Directory */}
            <Card className="luxury-shadow">
              <CardHeader>
                <CardTitle>Recommended Partners</CardTitle>
                <CardDescription>AI-curated partnership opportunities based on your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Partner Card 1 */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">MS</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Microsoft</h3>
                          <p className="text-sm text-muted-foreground">Technology</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        95% Match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Global technology leader with strong enterprise solutions and cloud infrastructure.
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>📍 Redmond, WA</span>
                      <span>👥 221,000 employees</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Connect</Button>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </div>
                  </div>

                  {/* Partner Card 2 */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-bold text-lg">N</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Netflix</h3>
                          <p className="text-sm text-muted-foreground">Entertainment</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        87% Match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Leading streaming platform with global reach and content creation capabilities.
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>📍 Los Gatos, CA</span>
                      <span>👥 12,800 employees</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Connect</Button>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </div>
                  </div>

                  {/* Partner Card 3 */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-purple-600 font-bold text-lg">S</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Spotify</h3>
                          <p className="text-sm text-muted-foreground">Music & Audio</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        82% Match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Audio streaming platform with personalization and discovery capabilities.
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>📍 Stockholm, Sweden</span>
                      <span>👥 9,800 employees</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Connect</Button>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </div>
                  </div>

                  {/* Partner Card 4 */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-bold text-lg">NV</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">NVIDIA</h3>
                          <p className="text-sm text-muted-foreground">Semiconductors</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        91% Match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Leading AI computing platform with cutting-edge GPU technology.
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>📍 Santa Clara, CA</span>
                      <span>👥 29,600 employees</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Connect</Button>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </div>
                  </div>

                  {/* Partner Card 5 */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <span className="text-yellow-600 font-bold text-lg">U</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Uber</h3>
                          <p className="text-sm text-muted-foreground">Transportation</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        78% Match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Mobility platform connecting riders and drivers with global presence.
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>📍 San Francisco, CA</span>
                      <span>👥 32,800 employees</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Connect</Button>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </div>
                  </div>

                  {/* Partner Card 6 */}
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-indigo-600 font-bold text-lg">A</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Adobe</h3>
                          <p className="text-sm text-muted-foreground">Software</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-indigo-600 border-indigo-600">
                        85% Match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Creative software solutions and digital experience platforms.
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>📍 San Jose, CA</span>
                      <span>👥 28,000 employees</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Connect</Button>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline">
                    Load More Partners
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Partnership Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Active Partnerships
                  </CardTitle>
                  <CardDescription>Manage your current partnership relationships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">G</span>
                        </div>
                        <div>
                          <p className="font-medium">Google</p>
                          <p className="text-sm text-muted-foreground">Strategic Alliance</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-bold text-sm">A</span>
                        </div>
                        <div>
                          <p className="font-medium">Amazon</p>
                          <p className="text-sm text-muted-foreground">Technology Partnership</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-bold text-sm">S</span>
                        </div>
                        <div>
                          <p className="font-medium">Salesforce</p>
                          <p className="text-sm text-muted-foreground">Integration Partner</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    View All Partnerships
                  </Button>
                </CardContent>
              </Card>

              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Partnership Insights
                  </CardTitle>
                  <CardDescription>Key metrics and performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Partnership Success Rate</span>
                      <span className="font-semibold">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average Deal Size</span>
                      <span className="font-semibold">$2.4M</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Time to Close</span>
                      <span className="font-semibold">45 days</span>
                    </div>
                    <Progress value={60} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Partner Satisfaction</span>
                      <span className="font-semibold">4.8/5</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    View Detailed Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-8 animate-fade-in">
            {/* Report Generation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Custom Report Builder
                  </CardTitle>
                  <CardDescription>Create tailored reports for your partnership analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Report Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="partnership-analysis">Partnership Analysis</SelectItem>
                          <SelectItem value="market-insights">Market Insights</SelectItem>
                          <SelectItem value="roi-projection">ROI Projection</SelectItem>
                          <SelectItem value="competitive-analysis">Competitive Analysis</SelectItem>
                          <SelectItem value="risk-assessment">Risk Assessment</SelectItem>
                          <SelectItem value="executive-summary">Executive Summary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Time Period</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                          <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                          <SelectItem value="last-quarter">Last Quarter</SelectItem>
                          <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                          <SelectItem value="last-year">Last Year</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Include Sections</label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Executive Summary</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Key Metrics</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Charts & Graphs</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Detailed Analysis</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Recommendations</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Risk Assessment</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Recent Reports
                  </CardTitle>
                  <CardDescription>Your latest generated reports and analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Q4 Partnership Analysis</p>
                          <p className="text-xs text-muted-foreground">Generated 2 hours ago</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">ROI Projection Report</p>
                          <p className="text-xs text-muted-foreground">Generated yesterday</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Target className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Market Insights Summary</p>
                          <p className="text-xs text-muted-foreground">Generated 3 days ago</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Risk Assessment Report</p>
                          <p className="text-xs text-muted-foreground">Generated 1 week ago</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    View All Reports
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Dashboard */}
            <Card className="luxury-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Analytics Dashboard
                </CardTitle>
                <CardDescription>Comprehensive insights and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">847</div>
                    <div className="text-sm text-blue-600/80">Total Analyses</div>
                    <div className="text-xs text-green-600 mt-1">↑ 12% vs last month</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$4.2M</div>
                    <div className="text-sm text-green-600/80">Projected ROI</div>
                    <div className="text-xs text-green-600 mt-1">↑ 8% vs last month</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">156</div>
                    <div className="text-sm text-purple-600/80">Active Partners</div>
                    <div className="text-xs text-green-600 mt-1">↑ 23% vs last month</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">92%</div>
                    <div className="text-sm text-orange-600/80">Success Rate</div>
                    <div className="text-xs text-green-600 mt-1">↑ 3% vs last month</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Partnership Performance Trends</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Interactive chart showing partnership performance over time</p>
                        <p className="text-sm text-gray-400 mt-1">Data visualization coming soon</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Industry Distribution</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Partnership distribution across industries</p>
                        <p className="text-sm text-gray-400 mt-1">Interactive pie chart coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Scheduled Reports
                  </CardTitle>
                  <CardDescription>Automated report generation and delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Weekly Partnership Summary</p>
                        <p className="text-xs text-muted-foreground">Every Monday at 9:00 AM</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Monthly ROI Analysis</p>
                        <p className="text-xs text-muted-foreground">1st of every month at 8:00 AM</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Quarterly Executive Report</p>
                        <p className="text-xs text-muted-foreground">Every quarter end</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Schedule
                  </Button>
                </CardContent>
              </Card>

              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Report Settings
                  </CardTitle>
                  <CardDescription>Configure your reporting preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Notifications</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-save Reports</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Include Charts</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compress Large Files</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Format</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="PDF" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="powerpoint">PowerPoint</SelectItem>
                        <SelectItem value="word">Word</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="w-full">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Sample data for charts (moved outside component)
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

export default App
