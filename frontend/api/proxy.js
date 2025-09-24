// api/proxy-enhanced.js - Enhanced version with caching and retries
const CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const requestBody = req.body;
    const cacheKey = JSON.stringify(requestBody);
    
    // Check cache
    const cached = CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('💾 Serving from cache');
      return res.status(200).json({
        ...cached.data,
        cached: true,
        cache_timestamp: cached.timestamp
      });
    }

    // Retry logic
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt} to connect to backend`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const backendResponse = await fetch('https://impactlens-platform-20d6698d163f.herokuapp.com/api/test-openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (backendResponse.ok) {
          const data = await backendResponse.json();
          
          // Cache successful response
          CACHE.set(cacheKey, {
            data: data,
            timestamp: Date.now()
          });
          
          return res.status(200).json({
            ...data,
            attempts: attempt,
            proxy_used: true
          });
        }
        
        lastError = new Error(`Backend responded with ${backendResponse.status}`);
        
      } catch (error) {
        lastError = error;
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    }

    throw lastError;

  } catch (error) {
    console.error('Proxy service failed after retries:', error);
    
    return res.status(500).json({
      error: 'Service unavailable: ' + error.message,
      service_used: 'proxy-fallback',
      analysis: getFallbackAnalysis(req.body),
      proxy_error: true
    });
  }
}

function getFallbackAnalysis(requestBody) {
  // Generate reasonable fallback data based on input
  const { brand_a, brand_b } = requestBody;
  
  return {
    brand_alignment_score: Math.floor(Math.random() * 30) + 70, // 70-100
    audience_overlap_percentage: Math.floor(Math.random() * 40) + 60, // 60-100
    roi_projection: Math.floor(Math.random() * 100) + 150, // 150-250
    risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    key_risks: ['Service connectivity issue', 'Using simulated data', 'Please check backend service'],
    recommendations: [
      `Partnership between ${brand_a} and ${brand_b} shows potential`,
      'Consider conducting further market research',
      'Re-run analysis when service is restored'
    ],
    market_insights: ['Analysis based on fallback data due to service issue']
  };
}
