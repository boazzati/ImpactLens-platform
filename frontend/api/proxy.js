// api/proxy.js - Fixed version for Vercel
export default async function handler(request, response) {
  // Log the request for debugging
  console.log('Proxy received request:', {
    method: request.method,
    url: request.url,
    headers: request.headers,
    body: request.body
  });

  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  // Only allow POST requests
  if (request.method !== 'POST') {
    console.log('Method not allowed:', request.method);
    return response.status(405).json({ 
      error: 'Method Not Allowed',
      allowed: ['POST'],
      received: request.method 
    });
  }
  
  try {
    // Parse the request body
    let body;
    try {
      body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    } catch (parseError) {
      return response.status(400).json({ 
        error: 'Invalid JSON in request body',
        details: parseError.message 
      });
    }
    
    const { brand_a, brand_b, partnership_type, target_audience, budget_range } = body;
    
    // Validate required fields
    if (!brand_a || !brand_b || !partnership_type) {
      return response.status(400).json({
        error: 'Missing required fields',
        required: ['brand_a', 'brand_b', 'partnership_type'],
        received: { brand_a, brand_b, partnership_type }
      });
    }
    
    console.log('Forwarding request to backend:', { brand_a, brand_b, partnership_type });
    
    // Forward to your Heroku backend
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
    
    console.log('Backend response status:', backendResponse.status);
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(`Backend responded with ${backendResponse.status}: ${errorText}`);
    }
    
    const data = await backendResponse.json();
    console.log('Backend response data:', data);
    
    return response.status(200).json({
      ...data,
      proxy_used: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    
    return response.status(500).json({
      error: 'Proxy service error',
      message: error.message,
      service_used: 'proxy-fallback',
      timestamp: new Date().toISOString()
    });
  }
}
