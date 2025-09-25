// api/proxy.js - Netlify Serverless Function Proxy
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests to the OpenAI endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔗 Proxy received request:', {
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    const { brand_a, brand_b, partnership_type, target_audience, budget_range } = req.body;

    // Validate required fields
    if (!brand_a || !brand_b || !partnership_type) {
      return res.status(400).json({
        error: 'Missing required fields: brand_a, brand_b, partnership_type'
      });
    }

    // Forward request to Heroku backend
    const backendResponse = await fetch('https://impactlens-platform-20d6698d163f.herokuapp.com/api/test-openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ImpactLens-Proxy/1.0'
      },
      body: JSON.stringify({
        brand_a,
        brand_b,
        partnership_type,
        target_audience: target_audience || 'Not specified',
        budget_range: budget_range || 'Not specified'
      }),
      timeout: 30000 // 30 second timeout
    });

    console.log('📡 Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorText
      });
      
      throw new Error(`Backend responded with ${backendResponse.status}: ${backendResponse.statusText}`);
    }

    const data = await backendResponse.json();
    
    console.log('✅ Proxy successful, returning data to frontend');
    
    return res.status(200).json({
      ...data,
      proxy_used: true,
      proxy_timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    
    // Return a structured error response
    return res.status(500).json({
      error: 'Proxy service error: ' + error.message,
      service_used: 'proxy-fallback',
      analysis: {
        brand_alignment_score: 75,
        audience_overlap_percentage: 65,
        roi_projection: 150,
        risk_level: 'Medium',
        key_risks: ['Service temporarily unavailable', 'Using fallback data'],
        recommendations: ['Please try again in a few moments', 'Check backend service status'],
        market_insights: ['Service connectivity issue detected']
      },
      proxy_error: true
    });
  }
}
