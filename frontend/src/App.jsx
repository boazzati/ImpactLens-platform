import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    brandA: '',
    brandB: '',
    partnershipType: '',
    targetAudience: '',
    budgetRange: ''
  })

  // API Base URL - your Heroku backend
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://impactlens-platform-20d6698d163f.herokuapp.com'

  // Real API integration function
  const startAnalysis = async ( ) => {
    if (!formData.brandA || !formData.brandB) {
      setError('Please fill in both brand names')
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisResults(null)
    setError('')

    try {
      // Step 1: Create scenario
      const scenarioResponse = await fetch(`${API_BASE_URL}/api/scenarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand_a: formData.brandA,
          brand_b: formData.brandB,
          partnership_type: formData.partnershipType,
          target_audience: formData.targetAudience,
          budget_range: formData.budgetRange
        })
      })

      if (!scenarioResponse.ok) {
        throw new Error('Failed to create scenario')
      }

      const scenario = await scenarioResponse.json()
      setAnalysisProgress(25)

      // Step 2: Start analysis
      const analysisResponse = await fetch(`${API_BASE_URL}/api/scenarios/${scenario.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!analysisResponse.ok) {
        throw new Error('Failed to start analysis')
      }

      const analysisJob = await analysisResponse.json()
      setAnalysisProgress(50)

      // Step 3: Poll for results
      let jobCompleted = false
      let attempts = 0
      const maxAttempts = 30 // 30 seconds timeout

      while (!jobCompleted && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        attempts++

        const statusResponse = await fetch(`${API_BASE_URL}/api/jobs/${analysisJob.job_id}`)
        
        if (!statusResponse.ok) {
          throw new Error('Failed to get job status')
        }

        const jobStatus = await statusResponse.json()
        setAnalysisProgress(50 + (attempts / maxAttempts) * 50)

        if (jobStatus.status === 'completed') {
          setAnalysisResults(jobStatus.result)
          setAnalysisProgress(100)
          jobCompleted = true
        } else if (jobStatus.status === 'failed') {
          throw new Error(jobStatus.error || 'Analysis failed')
        }
      }

      if (!jobCompleted) {
        throw new Error('Analysis timed out')
      }

    } catch (err) {
      console.error('Analysis error:', err)
      setError(err.message || 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setIsAnalyzing(false)
    setAnalysisProgress(0)
    setAnalysisResults(null)
    setError('')
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (analysisResults || error) {
      resetAnalysis()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ImpactLens</h1>
                <p className="text-xs text-gray-500">Partnership Intelligence Platform</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('scenarios')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'scenarios'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Scenarios
              </button>
              <button
                onClick={() => setActiveTab('partners')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'partners'
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Partners
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'reports'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Reports
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-lg">🔔</span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-lg">⚙️</span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-lg">👤</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'scenarios' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-yellow-600">✨</span>
                <h2 className="text-xl font-semibold text-gray-900">Partnership Scenario Builder</h2>
              </div>
              <p className="text-gray-600 mb-6">Create and analyze new partnership opportunities</p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-red-600 mb-1">Brand A</label>
                    <input
                      type="text"
                      placeholder="Enter first brand name"
                      className="w-full px-3 py-2 border-2 border-red-200 rounded-md focus:outline-none focus:border-red-400"
                      value={formData.brandA}
                      onChange={(e) => handleInputChange('brandA', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-600 mb-1">Brand B</label>
                    <input
                      type="text"
                      placeholder="Enter second brand name"
                      className="w-full px-3 py-2 border-2 border-blue-200 rounded-md focus:outline-none focus:border-blue-400"
                      value={formData.brandB}
                      onChange={(e) => handleInputChange('brandB', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-600 mb-1">Partnership Type</label>
                  <select
                    className="w-full px-3 py-2 border-2 border-green-200 rounded-md focus:outline-none focus:border-green-400"
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
                  <label className="block text-sm font-medium text-yellow-600 mb-1">Target Audience</label>
                  <input
                    type="text"
                    placeholder="Describe target audience"
                    className="w-full px-3 py-2 border-2 border-yellow-200 rounded-md focus:outline-none focus:border-yellow-400"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-600 mb-1">Budget Range</label>
                  <select
                    className="w-full px-3 py-2 border-2 border-purple-200 rounded-md focus:outline-none focus:border-purple-400"
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

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm">Error: {error}</p>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Analysis Progress</span>
                      <span className="text-sm text-blue-600">{Math.round(analysisProgress)}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{width: `${analysisProgress}%`}}
                      ></div>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">AI is analyzing partnership potential...</p>
                  </div>
                )}

                <button
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-medium py-3 px-4 rounded-md hover:from-pink-500 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}
                </button>
              </div>
            </div>

            {analysisResults && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-green-600">📊</span>
                  <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
                </div>
                <p className="text-gray-600 mb-6">AI-powered partnership insights</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">
                      {analysisResults.brand_alignment_score || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Brand Alignment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {analysisResults.audience_overlap_percentage ? `${Math.round(analysisResults.audience_overlap_percentage)}%` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Audience Overlap</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {analysisResults.roi_projection ? `${Math.round(analysisResults.roi_projection)}%` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">ROI Projection</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${
                      analysisResults.risk_level === 'Low' ? 'text-green-600' : 
                      analysisResults.risk_level === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {analysisResults.risk_level || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Risk Level</div>
                  </div>
                </div>

                {analysisResults.recommendations && analysisResults.recommendations.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {analysisResults.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium py-2 px-4 rounded-md hover:from-purple-600 hover:to-purple-700 transition-all duration-200">
                    Export Report
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-2 px-4 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                    Share Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab !== 'scenarios' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚧</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-gray-600">This section is under development</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
