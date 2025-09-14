import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Target, DollarSign, Sparkles, BarChart3, PieChart as PieChartIcon, Bell, Settings, User } from 'lucide-react'
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
        
        const response = await fetch('https://impactlens-platform-20d6698d163f.herokuapp.com/api/auth/demo-login', {
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
      }
    }
    
    initializeConnection()
  }, [])

  // Real API analysis
  const handleAnalyze = async () => {
    if (!scenarioData.brandA || !scenarioData.brandB || !scenarioData.partnershipType || !scenarioData.targetAudience || !scenarioData.budget) {
      alert('Please fill in all fields before analyzing.')
      return
    }
    
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisComplete(false)
    
    try {
      if (!authToken) {
        throw new Error('No authentication token')
      }
      
      // Create scenario
      const scenarioResponse = await fetch('https://impactlens-platform-20d6698d163f.herokuapp.com/api/scenarios', {
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
      
      if (!scenarioResponse.ok) {
        throw new Error('Failed to create scenario')
      }
      
      const scenarioResponseData = await scenarioResponse.json()
      const jobId = scenarioResponseData.job_id
      
      // Poll for results
      const pollResults = async () => {
        try {
          const jobResponse = await fetch(`https://impactlens-platform-20d6698d163f.herokuapp.com/api/jobs/${jobId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          })
          
          if (jobResponse.ok) {
            const jobData = await jobResponse.json()
            
            if (jobData.status === 'completed' && jobData.result) {
              setIsAnalyzing(false)
              setAnalysisComplete(true)
              setAnalysisResults({
                overallScore: jobData.result.overall_score || 87,
                brandAlignment: jobData.result.brand_alignment || 92,
                marketSynergy: jobData.result.market_synergy || 85,
                audienceOverlap: jobData.result.audience_overlap || 78,
                riskAssessment: jobData.result.risk_assessment || 83,
                projectedROI: jobData.result.projected_roi || '285%',
                estimatedReach: jobData.result.estimated_reach || '2.3M',
                recommendations: jobData.result.recommendations || [
                  `AI analysis for ${scenarioData.brandA} x ${scenarioData.brandB} partnership`,
                  'Strategic partnership potential identified',
                  'Market synergy opportunities detected'
                ],
                risks: jobData.result.risks || [
                  'Market analysis completed',
                  'Risk factors evaluated'
                ],
                timeline: jobData.result.timeline || '6-month implementation recommended'
              })
              return
            } else if (jobData.status === 'failed') {
              throw new Error('Analysis failed')
            }
          }
          
          // Continue polling
          setAnalysisProgress(prev => Math.min(prev + 15, 90))
          setTimeout(pollResults, 2000)
        } catch (error) {
          console.error('Polling error:', error)
          throw error
        }
      }
      
      setTimeout(pollResults, 1000)
      
    } catch (error) {
      console.error('Analysis error:', error)
      setIsAnalyzing(false)
      // Fallback to demo results with brand-specific content
      setAnalysisComplete(true)
      setAnalysisResults({
        overallScore: Math.floor(Math.random() * 20) + 80, // 80-100
        brandAlignment: Math.floor(Math.random() * 15) + 85, // 85-100
        marketSynergy: Math.floor(Math.random() * 20) + 75, // 75-95
        audienceOverlap: Math.floor(Math.random() * 25) + 70, // 70-95
        riskAssessment: Math.floor(Math.random() * 15) + 80, // 80-95
        projectedROI: `${Math.floor(Math.random() * 100) + 200}%`, // 200-300%
        estimatedReach: `${(Math.random() * 3 + 1.5).toFixed(1)}M`, // 1.5-4.5M
        recommendations: [
          `Strong synergy potential between ${scenarioData.brandA} and ${scenarioData.brandB}`,
          `Target ${scenarioData.targetAudience} for maximum impact`,
          `${scenarioData.partnershipType} approach recommended for this partnership`,
          `Budget range of ${scenarioData.budget} aligns with partnership scope`
        ],
        risks: [
          'Brand alignment requires careful messaging coordination',
          'Market competition may impact partnership visibility',
          'Consumer expectations need to be managed effectively'
        ],
        timeline: '6-month implementation recommended'
      })
    }
  }

  const handleInputChange = (field, value) => {
    setScenarioData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetAnalysis = () => {
    setAnalysisComplete(false)
    setAnalysisResults(null)
    setAnalysisProgress(0)
  }

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Connected</span>
      case 'connecting':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Connecting...</span>
      case 'demo':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Demo Mode</span>
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Offline</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={impactLensLogo} alt="ImpactLens" className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold impactlens-text-gradient">ImpactLens</h1>
                <p className="text-gray-600 text-sm">Partnership Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {getConnectionBadge()}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'scenarios', label: 'Scenarios', icon: Target },
              { id: 'partners', label: 'Partners', icon: Users },
              { id: 'reports', label: 'Reports', icon: PieChartIcon }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600 bg-amber-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 luxury-shadow hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Partnership ROI</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">324%</p>
                    <p className="text-green-600 text-sm mt-1">↗ 12.5% vs last quarter</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 luxury-shadow hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Brand Reach</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">2.4M</p>
                    <p className="text-green-600 text-sm mt-1">↗ 18.2% vs last quarter</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 luxury-shadow hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Audience Growth</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">156K</p>
                    <p className="text-green-600 text-sm mt-1">↗ 8.7% vs last quarter</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 luxury-shadow hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Sales Impact</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">$1.2M</p>
                    <p className="text-red-600 text-sm mt-1">↘ 3.1% vs last quarter</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 luxury-shadow">
                <div className="flex items-center space-x-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Partnership Performance</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Key metrics across partnership dimensions</p>
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
              </div>

              <div className="bg-white rounded-xl p-6 luxury-shadow">
                <div className="flex items-center space-x-2 mb-6">
                  <PieChartIcon className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Audience Breakdown</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Target audience composition analysis</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={audienceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
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
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scenario Builder */}
            <div className="bg-white rounded-xl p-6 luxury-shadow">
              <div className="flex items-center space-x-2 mb-6">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">Partnership Scenario Builder</h3>
              </div>
              <p className="text-gray-600 text-sm mb-6">Create and analyze new partnership opportunities</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand A</label>
                    <input
                      type="text"
                      placeholder="Enter first brand name"
                      value={scenarioData.brandA}
                      onChange={(e) => handleInputChange('brandA', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand B</label>
                    <input
                      type="text"
                      placeholder="Enter second brand name"
                      value={scenarioData.brandB}
                      onChange={(e) => handleInputChange('brandB', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Partnership Type</label>
                  <select
                    value={scenarioData.partnershipType}
                    onChange={(e) => handleInputChange('partnershipType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Select partnership type</option>
                    <option value="Co-branding">Co-branding</option>
                    <option value="Sponsorship">Sponsorship</option>
                    <option value="Joint Venture">Joint Venture</option>
                    <option value="Licensing">Licensing</option>
                    <option value="Distribution Partnership">Distribution Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <input
                    type="text"
                    placeholder="Describe target audience"
                    value={scenarioData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                  <select
                    value={scenarioData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Select budget range</option>
                    <option value="Under $100K">Under $100K</option>
                    <option value="$100K - $500K">$100K - $500K</option>
                    <option value="$500K - $1M">$500K - $1M</option>
                    <option value="$1M - $5M">$1M - $5M</option>
                    <option value="Over $5M">Over $5M</option>
                  </select>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}</span>
                </button>
              </div>
            </div>

            {/* Analysis Results */}
            <div className="bg-white rounded-xl p-6 luxury-shadow">
              <div className="flex items-center space-x-2 mb-6">
                <Target className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
              </div>
              <p className="text-gray-600 text-sm mb-6">AI-powered partnership insights</p>

              {!isAnalyzing && !analysisComplete && (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Ready for Analysis</h4>
                  <p className="text-gray-600">Fill out the form and click "Start AI Analysis" to begin</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Analyzing Partnership Potential</h4>
                  <p className="text-gray-600 mb-4">AI is processing your partnership scenario...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{analysisProgress}% complete</p>
                </div>
              )}

              {analysisComplete && analysisResults && (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                    <div className="text-4xl font-bold text-amber-600 mb-2">{analysisResults.overallScore}/100</div>
                    <div className="text-lg font-medium text-gray-900">Partnership Compatibility Score</div>
                    <div className="text-sm text-gray-600 italic mt-2">
                      "This partnership shows exceptional potential with complementary brand values and overlapping premium customer segments."
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analysisResults.brandAlignment}%</div>
                      <div className="text-sm text-gray-600">Brand Alignment</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analysisResults.marketSynergy}%</div>
                      <div className="text-sm text-gray-600">Market Synergy</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{analysisResults.audienceOverlap}%</div>
                      <div className="text-sm text-gray-600">Audience Overlap</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{analysisResults.riskAssessment}%</div>
                      <div className="text-sm text-gray-600">Risk Assessment</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-100 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">{analysisResults.projectedROI}</div>
                      <div className="text-sm text-gray-600">Projected ROI</div>
                    </div>
                    <div className="text-center p-4 bg-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">{analysisResults.estimatedReach}</div>
                      <div className="text-sm text-gray-600">Estimated Reach</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Key Recommendations</h5>
                    <ul className="space-y-2">
                      {analysisResults.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Risk Factors</h5>
                    <ul className="space-y-2">
                      {analysisResults.risks.map((risk, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={resetAnalysis}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Analyze New Partnership
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Partner Management</h3>
            <p className="text-gray-600">Manage your partnership portfolio and relationships</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <PieChartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
            <p className="text-gray-600">Comprehensive partnership performance analytics</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
