export default async function handler(req, res) {
  const { method, body } = req;
  
  try {
    const response = await fetch('https://impactlens-platform-20d6698d163f.herokuapp.com/api/test-openai', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
