  const checkBackendConnection = async () => {
    setApiStatus('connecting')
    try {
      // Test connection using our test endpoint
      const response = await fetch('/api/test');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Backend connection successful:', data);
      
      setApiStatus('connected')
      setConnectionTested(true)
    } catch (error) {
      console.error('Backend connection failed:', error)
      setApiStatus('disconnected')
      setConnectionTested(true)
    }
  }
