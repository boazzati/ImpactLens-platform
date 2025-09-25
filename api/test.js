// api/test.js - Simple test endpoint
export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method === 'GET') {
    return response.status(200).json({
      status: 'success',
      message: 'Test API is working!',
      timestamp: new Date().toISOString(),
      method: 'GET'
    });
  }

  if (request.method === 'POST') {
    return response.status(200).json({
      status: 'success',
      message: 'Test API received POST request!',
      timestamp: new Date().toISOString(),
      method: 'POST',
      body: request.body
    });
  }

  return response.status(405).json({ 
    error: 'Method not allowed',
    allowed: ['GET', 'POST'] 
  });
}
