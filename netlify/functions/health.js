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

  try {
    // Try to check Heroku backend health
    const backendUrl = 'https://impactlens-platform-20d6698d163f.herokuapp.com/api/health';
    
    try {
      const response = await fetch(backendUrl);
      const backendHealth = await response.json();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          service: 'netlify-proxy',
          backend_status: 'connected',
          backend_health: backendHealth,
          timestamp: new Date().toISOString()
        })
      };
    } catch (backendError) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          service: 'netlify-proxy',
          backend_status: 'disconnected',
          backend_error: backendError.message,
          timestamp: new Date().toISOString()
        })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        service: 'netlify-proxy',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
