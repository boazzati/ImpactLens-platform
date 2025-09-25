  const checkBackendConnection = async () => {
    setApiStatus('connecting');
    try {
      // First try the proxy health check
      const proxyResponse = await fetch('/api/health');
      if (proxyResponse.ok) {
        const healthData = await proxyResponse.json();
        console.log('✅ Proxy health check:', healthData);
        setApiStatus('connected');
        setConnectionTested(true);
        return;
      }
    } catch (proxyError) {
      console.log('Proxy health check failed:', proxyError);
    }

    // Fallback: Try direct Heroku connection
    try {
      const response = await fetch('https://impactlens-platform-20d6698d163f.herokuapp.com/api/health');
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
      }
    } catch (error) {
      console.error('All connection methods failed:', error);
      setApiStatus('disconnected');
    }
    setConnectionTested(true);
  }
