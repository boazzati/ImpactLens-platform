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
