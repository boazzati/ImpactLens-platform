// /api/proxy.js (Vercel serverless function)
// This proxy bypasses CORS restrictions by handling requests server-to-server

export default async function handler(req, res) {
  // Enable CORS for the frontend domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests for the analysis
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('🚀 Proxy: Forwarding request to Heroku backend...');
    console.log('Request body:', req.body);

    const response = await fetch("https://impactlens-platform-20d6698d163f.herokuapp.com/api/test-openai", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        // Forward auth headers if needed
        ...(req.headers.authorization && { "Authorization": req.headers.authorization }),
      },
      body: JSON.stringify(req.body),
    });

    console.log('📡 Proxy: Received response from Heroku:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Heroku backend error:', errorText);
      throw new Error(`Heroku backend responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Proxy: Successfully forwarded response');
    console.log('Service used:', data.service_used);
    console.log('Tokens used:', data.tokens_used);

    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Proxy error:", error);
    res.status(500).json({ 
      error: "Proxy request failed",
      details: error.message,
      status: 'error'
    });
  }
}
