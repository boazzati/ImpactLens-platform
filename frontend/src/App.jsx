import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [formData, setFormData] = useState({
    brandA: '',
    brandB: '',
    partnershipType: '',
    targetAudience: '',
    budgetRange: ''
  })

  // Mock analysis function that works
  const startAnalysis = () => {
    if (!formData.brandA || !formData.brandB) {
      alert('Please fill in both brand names')
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisResults(null)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsAnalyzing(false)
          
          // Generate dynamic results based on brands
          const results = generateAnalysisResults(formData.brandA, formData.brandB)
          setAnalysisResults(results)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 500)
  }

  // Generate dynamic results based on brand combination
  const generateAnalysisResults = (brandA, brandB) => {
    const brandPairs = {
      'tesla-apple': { alignment: 8.7, overlap: 73, roi: 285, risk: 'Low' },
      'louis vuitton-hermès': { alignment: 9.2, overlap: 85, roi: 320, risk: 'Low' },
      'nike-adidas': { alignment: 6.5, overlap: 45, roi: 180, risk: 'Medium' },
      'coca cola-pepsi': { alignment: 4.2, overlap: 35, roi: 120, risk: 'High' }
    }

    const key = `${brandA.toLowerCase()}-${brandB.toLowerCase()}`
    const reverseKey = `${brandB.toLowerCase()}-${brandA.toLowerCase()}`
    
    let metrics = brandPairs[key] || brandPairs[reverseKey]
    
    if (!metrics) {
      // Generate semi-random but consistent results
      const hash = (brandA + brandB).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      
      const alignment = 5.5 + (Math.abs(hash) % 40) / 10
      const overlap = 30 + (Math.abs(hash * 2) % 50)
      const roi = 120 + (Math.abs(hash * 3) % 200)
      const risks = ['Low', 'Medium', 'High']
      const risk = risks[Math.abs(hash) % 3]
      
      metrics = { alignment, overlap, roi, risk }
    }

    return {
      brandAlignment: metrics.alignment,
      audienceOverlap: metrics.overlap,
      roiProjection: metrics.roi,
      riskLevel: metrics.risk,
      recommendation: `This partnership between ${brandA} and ${brandB} shows ${metrics.alignment >= 8 ? 'excellent' : metrics.alignment >= 6 ? 'good' : 'moderate'} potential with ${metrics.overlap}% audience overlap. Consider proceeding with ${metrics.risk === 'Low' ? 'confidence' : 'careful planning'}.`
    }
  }

  const resetAnalysis = () => {
    setIsAnalyzing(false)
    setAnalysisProgress(0)
    setAnalysisResults(null)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (analysisResults) {
      resetAnalysis()
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Partnership ROI</p>
              <p className="text-2xl font-bold text-white">324%</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Brand Reach</p>
              <p className="text-2xl font-bold text-white">2.4M</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Audience Growth</p>
              <p className="text-2xl font-bold text-white">156K</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Sales Impact</p>
              <p className="text-2xl font-bold text-white">$1.2M</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Partnership Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Louis Vuitton × Hermès</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{width: '92%'}}></div>
                </div>
                <span className="text-white text-sm">92%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Tesla × Apple</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full" style={{width: '87%'}}></div>
                </div>
                <span className="text-white text-sm">87%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Nike × Adidas</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-teal-500 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
                <span className="text-white text-sm">65%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Audience Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Luxury Consumers</span>
              <span className="text-white">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Tech Enthusiasts</span>
              <span className="text-white">32%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Fashion Forward</span>
              <span className="text-white">23%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderScenarios = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">✨</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">Partnership Scenario Builder</h2>
        </div>
        <p className="text-white/70 mb-8">Create and analyze new partnership opportunities</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-white font-medium mb-2">Brand A</label>
            <input
              type="text"
              placeholder="Enter first brand name"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
              value={formData.brandA}
              onChange={(e) => handleInputChange('brandA', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Brand B</label>
            <input
              type="text"
              placeholder="Enter second brand name"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
              value={formData.brandB}
              onChange={(e) => handleInputChange('brandB', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-white font-medium mb-2">Partnership Type</label>
            <select
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              value={formData.partnershipType}
              onChange={(e) => handleInputChange('partnershipType', e.target.value)}
            >
              <option value="">Select partnership type</option>
              <option value="Co-Branding">Co-Branding</option>
              <option value="Sponsorship">Sponsorship</option>
              <option value="Product Collaboration">Product Collaboration</option>
              <option value="Event Partnership">Event Partnership</option>
              <option value="Licensing Agreement">Licensing Agreement</option>
            </select>
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Budget Range</label>
            <select
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              value={formData.budgetRange}
              onChange={(e) => handleInputChange('budgetRange', e.target.value)}
            >
              <option value="">Select budget range</option>
              <option value="$100K - $500K">$100K - $500K</option>
              <option value="$500K - $1M">$500K - $1M</option>
              <option value="$1M - $5M">$1M - $5M</option>
              <option value="$5M+">$5M+</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-white font-medium mb-2">Target Audience</label>
          <input
            type="text"
            placeholder="Describe target audience"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
            value={formData.targetAudience}
            onChange={(e) => handleInputChange('targetAudience', e.target.value)}
          />
        </div>

        {isAnalyzing && (
          <div className="mb-6">
            <label className="block text-white font-medium mb-2">Analysis Progress</label>
            <div className="w-full bg-white/20 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{width: `${analysisProgress}%`}}
              ></div>
            </div>
            <p className="text-white/70 text-sm">AI is analyzing partnership potential...</p>
          </div>
        )}

        <button
          onClick={startAnalysis}
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}
        </button>
      </div>

      {analysisResults && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📊</span>
            </div>
            <h3 className="text-2xl font-semibold text-white">Analysis Results</h3>
          </div>
          <p className="text-white/70 mb-6">AI-powered partnership insights</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">{analysisResults.brandAlignment}</div>
              <div className="text-white/70 text-sm">Brand Alignment</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{analysisResults.audienceOverlap}%</div>
              <div className="text-white/70 text-sm">Audience Overlap</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">{analysisResults.roiProjection}%</div>
              <div className="text-white/70 text-sm">ROI Projection</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${
                analysisResults.riskLevel === 'Low' ? 'text-green-400' : 
                analysisResults.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {analysisResults.riskLevel}
              </div>
              <div className="text-white/70 text-sm">Risk Level</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h4 className="text-white font-semibold mb-2">Recommendation</h4>
            <p className="text-white/80 text-sm leading-relaxed">
              {analysisResults.recommendation}
            </p>
          </div>

          <div className="flex space-x-4">
            <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
              Export Report
            </button>
            <button className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200">
              Share Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ImpactLens</h1>
                <p className="text-xs text-white/60">Partnership Intelligence Platform</p>
              </div>
            </div>
            
            <nav className="flex space-x-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'scenarios', label: 'Scenarios', icon: '🎯' },
                { id: 'partners', label: 'Partners', icon: '🤝' },
                { id: 'reports', label: 'Reports', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <button className="p-2 text-white/70 hover:text-white transition-colors">
                <span className="text-lg">🔔</span>
              </button>
              <button className="p-2 text-white/70 hover:text-white transition-colors">
                <span className="text-lg">⚙️</span>
              </button>
              <button className="p-2 text-white/70 hover:text-white transition-colors">
                <span className="text-lg">👤</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'scenarios' && renderScenarios()}
        {activeTab === 'partners' && (
          <div className="text-center text-white/70 py-12">
            <span className="text-4xl mb-4 block">🤝</span>
            <h2 className="text-2xl font-semibold mb-2">Partners</h2>
            <p>Partner management features coming soon</p>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="text-center text-white/70 py-12">
            <span className="text-4xl mb-4 block">📈</span>
            <h2 className="text-2xl font-semibold mb-2">Reports</h2>
            <p>Advanced reporting features coming soon</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
