// /api/health-check.js (Vercel serverless function)
// Simple health check endpoint to test proxy connectivity

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Test connection to Heroku backend using the main API endpoint
    const testData = {
      brand_a: "Test",
      brand_b: "Health",
      partnership_type: "Product Collaboration",
      target_audience: "Health check",
      budget_range: "Under $100K"
    };

    const response = await fetch("https://impactlens-platform-20d6698d163f.herokuapp.com/api/test-openai", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(testData),
    });

    if (response.ok) {
      const data = await response.json();
      res.status(200).json({
        status: 'connected',
        backend_status: 'healthy',
        service_used: data.service_used,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(200).json({
        status: 'backend_error',
        error: `Backend returned ${response.status}`,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(200).json({
      status: 'connection_failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
