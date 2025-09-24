// api/proxy.js - Fixed for Vercel deployment
export default async function handler(request, response) {
  // Log the request for debugging
  console.log('🔗 Proxy received request:', {
    method: request.method,
    url: request.url,
    body: request.body
  });

  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight');
    return response.status(200).end();
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    console.log('❌ Method not allowed:', request.method);
    return response.status(405).json({ 
      error: 'Method Not Allowed',
      message: `Only POST requests are allowed, received: ${request.method}`,
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
      console.log('📦 Parsed request body:', requestBody);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return response.status(400).json({ 
        error: 'Invalid JSON in request body',
        details: parseError.message 
      });
    }

    const { brand_a, brand_b, partnership_type, target_audience, budget_range } = requestBody;

    // Validate required fields
    if (!brand_a || !brand_b || !partnership_type) {
      console.log('❌ Missing required fields');
      return response.status(400).json({
        error: 'Missing required fields',
        required: ['brand_a', 'brand_b', 'partnership_type'],
        received: { brand_a, brand_b, partnership_type }
      });
    }

    console.log('🚀 Forwarding to Heroku backend:', { brand_a, brand_b, partnership_type });

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
      })
    });

    console.log('📡 Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend error:', errorText);
      throw new Error(`Backend responded with ${backendResponse.status}: ${errorText}`);
    }

    const data = await backendResponse.json();
    console.log('✅ Backend response successful');
    
    return response.status(200).json({
      ...data,
      proxy_used: true,
      proxy_timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Proxy error:', error);
    
    return response.status(500).json({
      error: 'Proxy service error',
      message: error.message,
      service_used: 'proxy-fallback',
      timestamp: new Date().toISOString()
    });
  }
}
