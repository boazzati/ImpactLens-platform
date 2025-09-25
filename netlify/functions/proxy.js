// netlify/functions/proxy.js - Enhanced Netlify Serverless Function Proxy
const CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests for analysis
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const requestData = JSON.parse(event.body);
    const cacheKey = JSON.stringify(requestData);
    
    console.log('🚀 Netlify proxy received request:', requestData);
    
    // Check cache
    const cached = CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('💾 Serving from cache');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...cached.data,
          cached: true,
          cache_timestamp: cached.timestamp
        })
      };
    }

    // Validate required fields
    if (!requestData.brand_a || !requestData.brand_b || !requestData.partnership_type) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields: brand_a, brand_b, partnership_type'
        })
      };
    }

    // Retry logic with exponential backoff
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt} to connect to backend`);
        
        const backendResponse = await fetch('https://impactlens-platform-20d6698d163f.herokuapp.com/api/test-openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            brand_a: requestData.brand_a,
            brand_b: requestData.brand_b,
            partnership_type: requestData.partnership_type,
            target_audience: requestData.target_audience || 'Not specified',
            budget_range: requestData.budget_range || 'Not specified'
          }),
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });

        if (backendResponse.ok) {
          const result = await backendResponse.json();
          console.log('✅ Backend response received');
          
          // Add proxy metadata
          const responseData = {
            ...result,
            proxy_used: true,
            proxy_timestamp: new Date().toISOString(),
            attempts: attempt
          };

          // Cache the result
          CACHE.set(cacheKey, {
            data: responseData,
            timestamp: Date.now()
          });

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(responseData)
          };
        } else {
          throw new Error(`Backend returned ${backendResponse.status}: ${backendResponse.statusText}`);
        }

      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        lastError = error;
        
        if (attempt < 3) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    // All attempts failed, provide fallback
    console.log('🔄 All attempts failed, providing fallback analysis');
    
    const fallbackAnalysis = getFallbackAnalysis(requestData);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fallbackAnalysis)
    };

  } catch (error) {
    console.error('💥 Proxy error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        service_used: 'error'
      })
    };
  }
};

function getFallbackAnalysis(requestBody) {
  const { brand_a, brand_b } = requestBody;
  
  return {
    analysis: {
      brand_alignment_score: Math.floor(Math.random() * 30) + 70, // 70-100
      audience_overlap_percentage: Math.floor(Math.random() * 40) + 60, // 60-100
      roi_projection: Math.floor(Math.random() * 100) + 150, // 150-250
      risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      key_risks: [
        'Service temporarily unavailable',
        'Using fallback analysis data',
        `Limited data available for ${brand_a} and ${brand_b} partnership`
      ],
      recommendations: [
        `Partnership between ${brand_a} and ${brand_b} shows potential based on available data`,
        'Consider conducting detailed market research when service is restored',
        'Monitor brand alignment metrics closely during partnership development'
      ],
      market_insights: [
        'Analysis based on fallback data due to service connectivity issue',
        'Please try again when backend service is restored',
        'Real-time insights will be available once connection is established'
      ]
    },
    service_used: 'fallback',
    proxy_used: true,
    proxy_error: true,
    proxy_timestamp: new Date().toISOString(),
    status: 'fallback_mode'
  };
}
