// api/proxy.js - Fixed version for Heroku CORS issues
export default async function handler(request, response) {
  // Log the incoming request
  console.log('🔗 Proxy received request:', {
    method: request.method,
    url: request.url,
    body: request.body
  });

  // Set CORS headers for the browser
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight request');
    return response.status(200).end();
  }
  
  // Only allow POST requests
  if (request.method !== 'POST') {
    console.log('❌ Method not allowed:', request.method);
    return response.status(405).json({ 
      error: 'Method Not Allowed',
      message: 'Only POST requests are supported',
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    // Parse the request body
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
      return response.status(400).json({
        error: 'Missing required fields',
        required: ['brand_a', 'brand_b', 'partnership_type'],
        received: { brand_a, brand_b, partnership_type }
      });
    }
    
    console.log('🚀 Forwarding to Heroku backend...');
    
    // Make request to Heroku backend with proper headers
    const backendResponse = await fetch('https://impactlens-platform-20d6698d163f.herokuapp.com/api/test-openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
      let errorText;
      try {
        errorText = await backendResponse.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      console.error('❌ Backend error details:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorText
      });
      
      // Handle specific error cases
      if (backendResponse.status === 403) {
        throw new Error(`Backend CORS restriction: ${errorText}. This is expected - using fallback data.`);
      }
      
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
    
    // Provide helpful error response
    return response.status(500).json({
      error: 'Proxy service error',
      message: error.message,
      service_used: 'proxy-fallback',
      suggestion: 'Check backend CORS configuration or use fallback data',
      timestamp: new Date().toISOString()
    });
  }
}
