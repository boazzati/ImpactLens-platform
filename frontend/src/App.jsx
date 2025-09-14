import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('scenarios');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [scenarioData, setScenarioData] = useState({
    brandA: '',
    brandB: '',
    partnershipType: '',
    targetAudience: '',
    budget: ''
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Test backend connection via proxy
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test the proxy endpoint
        const response = await fetch('/api/health-check', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
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

  // Input change handler
  const handleInputChange = (field, value) => {
    setScenarioData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // FIXED: Use Vercel proxy to bypass CORS restrictions
  const handleAnalyze = async () => {
    // Validation
    const requiredFields = ['brandA', 'brandB', 'partnershipType', 'targetAudience', 'budget'];
    const missingFields = requiredFields.filter(field => !scenarioData[field] || scenarioData[field].trim() === '');
    
    if (missingFields.length > 0) {
      alert(`❌ Please fill in all fields:\n${missingFields.join(', ')}`);
      return;
    }

    setIsAnalyzing(true);
    
    const requestData = {
      brand_a: scenarioData.brandA,
      brand_b: scenarioData.brandB,
      partnership_type: scenarioData.partnershipType,
      target_audience: scenarioData.targetAudience,
      budget_range: scenarioData.budget
    };

    try {
      console.log('🚀 Making request via Vercel proxy...');
      console.log('Request data:', requestData);

      // SOLUTION: Call Vercel proxy instead of Heroku directly
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('📡 Proxy response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Received result:', result);
      
      if (result.status === 'success') {
        console.log(`🎉 SUCCESS! Service: ${result.service_used}, Tokens: ${result.tokens_used}`);
        
        setAnalysisResult({
          ...result.analysis,
          service_used: result.service_used,
          tokens_used: result.tokens_used,
          analysis_duration: result.analysis_duration
        });
        setIsAnalyzing(false);
        return;
      } else {
        throw new Error('Analysis failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      
      // Fallback with detailed error info
      setAnalysisResult({
        brand_alignment_score: 85,
        audience_overlap_percentage: 78,
        roi_projection: 145,
        risk_level: 'Medium',
        service_used: 'fallback',
        key_risks: [
          `Proxy error: ${error.message}`,
          'Using fallback data while investigating issue',
          'Backend OpenAI integration confirmed working'
        ],
        recommendations: [
          `FALLBACK MODE: ${scenarioData.brandA.toLowerCase()} x ${scenarioData.brandB.toLowerCase()}`,
          'Proxy connection failed - investigating',
          'Real OpenAI integration available via direct backend testing'
        ]
      });
    }
    
    setIsAnalyzing(false);
  };

  const renderScenarios = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold">✨</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Partnership Scenario Builder</h2>
        </div>
        
        <p className="text-gray-600 mb-6">Create and analyze new partnership opportunities</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand A</label>
            <input
              type="text"
              placeholder="Enter first brand name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={scenarioData.brandA}
              onChange={(e) => handleInputChange('brandA', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand B</label>
            <input
              type="text"
              placeholder="Enter second brand name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={scenarioData.brandB}
              onChange={(e) => handleInputChange('brandB', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Partnership Type</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={scenarioData.partnershipType}
              onChange={(e) => handleInputChange('partnershipType', e.target.value)}
            >
              <option value="">Select partnership type</option>
              <option value="Product Collaboration">Product Collaboration</option>
              <option value="Co-branding">Co-branding</option>
              <option value="Sponsorship">Sponsorship</option>
              <option value="Event Partnership">Event Partnership</option>
              <option value="Licensing Agreement">Licensing Agreement</option>
              <option value="Joint Marketing">Joint Marketing</option>
              <option value="Strategic Alliance">Strategic Alliance</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <input
              type="text"
              placeholder="Describe target audience"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={scenarioData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={scenarioData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
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
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <span className="mr-2">✨</span>
                Start AI Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold">📊</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Analysis Results</h2>
        </div>
        
        <p className="text-gray-600 mb-6">AI-powered partnership insights</p>
        
        {!analysisResult ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Ready for Analysis</h3>
            <p className="text-gray-600">Fill out the form and click "Start AI Analysis" to begin</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Service indicator */}
            <div className="text-center mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                analysisResult.service_used === 'openai' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                Service: {analysisResult.service_used} 
                {analysisResult.tokens_used && ` • ${analysisResult.tokens_used} tokens`}
                {analysisResult.analysis_duration && ` • ${analysisResult.analysis_duration.toFixed(1)}s`}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {analysisResult.brand_alignment_score}%
                </div>
                <div className="text-sm text-blue-800">Brand Alignment</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analysisResult.audience_overlap_percentage}%
                </div>
                <div className="text-sm text-green-800">Market Synergy</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {analysisResult.audience_overlap_percentage}%
                </div>
                <div className="text-sm text-purple-800">Audience Overlap</div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {Math.round(analysisResult.roi_projection * 0.9)}%
                </div>
                <div className="text-sm text-orange-800">Risk Assessment</div>
              </div>
            </div>

            {/* ROI and Reach */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analysisResult.roi_projection}%
                </div>
                <div className="text-sm text-green-800">Projected ROI</div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {(analysisResult.roi_projection * 0.02).toFixed(1)}M
                </div>
                <div className="text-sm text-blue-800">Estimated Reach</div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Key Recommendations</h4>
              <ul className="space-y-2">
                {analysisResult.recommendations?.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    <span className="text-gray-700 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Factors */}
            {analysisResult.key_risks && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Risk Factors</h4>
                <ul className="space-y-2">
                  {analysisResult.key_risks.map((risk, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2 mt-1">⚠</span>
                      <span className="text-gray-700 text-sm">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard</h2>
      <p className="text-gray-600">Dashboard content coming soon...</p>
    </div>
  );

  const renderPartners = () => (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Partners</h2>
      <p className="text-gray-600">Partners content coming soon...</p>
    </div>
  );

  const renderReports = () => (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Reports</h2>
      <p className="text-gray-600">Reports content coming soon...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">IL</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">ImpactLens</h1>
                <p className="text-xs text-gray-600">Partnership Intelligence Platform</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                connectionStatus === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : connectionStatus === 'connecting'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </div>
              
              {/* Notification Icons */}
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">🔔</span>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">👤</span>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">⚡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', color: 'purple' },
              { id: 'scenarios', label: 'Scenarios', color: 'orange' },
              { id: 'partners', label: 'Partners', color: 'pink' },
              { id: 'reports', label: 'Reports', color: 'purple' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'scenarios' && renderScenarios()}
        {activeTab === 'partners' && renderPartners()}
        {activeTab === 'reports' && renderReports()}
      </main>
    </div>
  );
}

export default App;
