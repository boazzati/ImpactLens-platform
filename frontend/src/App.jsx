import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { BarChart3, Users, Target, Shield, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import impactLensLogo from './assets/impactlens-logojustsymbol.png'
import './App.css'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.herokuapp.com/api'

function App( ) {
  const [analysisData, setAnalysisData] = useState({
    brandName: '',
    partnerName: '',
    goals: '',
    targetAudience: '',
    budget: '',
    timeline: ''
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [error, setError] = useState(null)
  
  // Test API connection on component mount
  useEffect(() => {
    testApiConnection()
  }, [])

  const testApiConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      if (!response.ok) {
        console.warn('API health check failed, using demo mode')
      }
    } catch (error) {
      console.warn('API connection failed, using demo mode:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setAnalysisData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const validateForm = () => {
    const required = ['brandName', 'partnerName', 'goals', 'targetAudience']
    const missing = required.filter(field => !analysisData[field].trim())
    
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`)
      return false
    }
    return true
  }

  const startAnalysis = async () => {
    if (!validateForm()) return

    setIsAnalyzing(true)
    setError(null)
    setAnalysisResults(null)

    try {
      // Direct analysis call (simplified API)
      const response = await fetch(`${API_BASE_URL}/jobs/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario_data: analysisData,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Analysis request failed: ${response.status}`)
      }

      const results = await response.json()
      setAnalysisResults(results)
      setIsAnalyzing(false)

    } catch (error) {
      console.error('Analysis error:', error)
      setError(`Analysis failed: ${error.message}. Please check your API connection and OpenAI key.`)
      setIsAnalyzing(false)
    }
  }

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze partnership opportunities with precision and insight."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Strategic Partnerships",
      description: "Identify and evaluate luxury brand partnerships that align with your vision."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Market Intelligence",
      description: "Deep market insights to guide your partnership strategy and decision-making."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Risk Assessment",
      description: "Comprehensive risk analysis to protect your brand's reputation and value."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="impactlens-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src={impactLensLogo} 
                alt="ImpactLens Logo" 
                className="w-10 h-10 impactlens-logo"
              />
              <span className="text-2xl font-bold impactlens-text-gradient">ImpactLens</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#analysis" className="text-muted-foreground hover:text-foreground transition-colors">Analysis</a>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="impactlens-hero text-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              AI-Powered Partnership Intelligence
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Transform Your
              <span className="block impactlens-text-gradient">Partnership Strategy</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Leverage advanced AI to analyze, evaluate, and optimize strategic partnerships. 
              Make data-driven decisions that drive growth and enhance your brand's impact.
            </p>
          </div>
        </div>
      </section>

      {/* Analysis Section */}
      <section id="analysis" className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Partnership Analysis
            </h2>
            <p className="text-xl text-muted-foreground">
              Enter your partnership details for AI-powered analysis
            </p>
          </div>

          <Card className="impactlens-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Partnership Analysis Form
              </CardTitle>
              <CardDescription>
                Provide details about your brand and potential partnership for comprehensive analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Brand Name *</label>
                  <Input
                    placeholder="e.g., Luxury Fashion Co."
                    value={analysisData.brandName}
                    onChange={(e) => handleInputChange('brandName', e.target.value)}
                    className="impactlens-input"
                    disabled={isAnalyzing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Potential Partner *</label>
                  <Input
                    placeholder="e.g., Premium Hotel Chain"
                    value={analysisData.partnerName}
                    onChange={(e) => handleInputChange('partnerName', e.target.value)}
                    className="impactlens-input"
                    disabled={isAnalyzing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Partnership Goals *</label>
                <Textarea
                  placeholder="Describe your partnership objectives, target outcomes, and strategic goals..."
                  value={analysisData.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  className="impactlens-input min-h-[100px]"
                  disabled={isAnalyzing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Audience *</label>
                <Textarea
                  placeholder="Describe your target demographic, psychographics, and market segments..."
                  value={analysisData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  className="impactlens-input min-h-[100px]"
                  disabled={isAnalyzing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Budget Range</label>
                  <Input
                    placeholder="e.g., $100K - $500K"
                    value={analysisData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="impactlens-input"
                    disabled={isAnalyzing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timeline</label>
                  <Input
                    placeholder="e.g., 6-12 months"
                    value={analysisData.timeline}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                    className="impactlens-input"
                    disabled={isAnalyzing}
                  />
                </div>
              </div>

              <Button 
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className="w-full impactlens-button-primary text-lg py-6"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Partnership...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Start AI Analysis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResults && (
            <Card className="impactlens-card mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Analysis Results
                </CardTitle>
                <CardDescription>
                  AI-powered partnership analysis completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Partnership Score */}
                  <div className="text-center p-6 bg-primary/5 rounded-lg">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {analysisResults.partnership_score || 'N/A'}/100
                    </div>
                    <div className="text-lg font-medium">Partnership Score</div>
                  </div>

                  {/* Analysis Text */}
                  <div>
                    <h4 className="font-semibold mb-3">Detailed Analysis</h4>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{analysisResults.analysis_text}</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {analysisResults.recommendations && analysisResults.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Key Recommendations</h4>
                      <ul className="space-y-2">
                        {analysisResults.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {analysisResults.risk_factors && analysisResults.risk_factors.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Risk Factors</h4>
                      <ul className="space-y-2">
                        {analysisResults.risk_factors.map((risk, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for
              <span className="impactlens-text-gradient"> Strategic Growth</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to identify, evaluate, and execute successful partnerships
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="impactlens-card group">
                <CardHeader>
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img 
                src={impactLensLogo} 
                alt="ImpactLens Logo" 
                className="w-8 h-8 impactlens-logo"
              />
              <span className="text-xl font-bold impactlens-text-gradient">ImpactLens</span>
            </div>
            <div className="text-center text-muted-foreground">
              <p>&copy; 2024 ImpactLens. Empowering strategic partnerships with AI.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
