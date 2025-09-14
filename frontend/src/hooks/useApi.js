import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

// Custom hook for API calls with loading and error states
export function useApi(apiCall, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for dashboard statistics
export function useDashboardStats() {
  return useApi(() => apiService.getDashboardStats());
}

// Hook for scenarios
export function useScenarios() {
  return useApi(() => apiService.getScenarios());
}

// Hook for job status polling
export function useJobStatus(jobId, pollingInterval = 2000) {
  const [jobStatus, setJobStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    let intervalId;
    
    const pollJobStatus = async () => {
      try {
        setLoading(true);
        const status = await apiService.getJobStatus(jobId);
        setJobStatus(status);
        
        // Stop polling if job is completed or failed
        if (status.status === 'completed' || status.status === 'failed') {
          if (intervalId) {
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        setError(err.message);
        if (intervalId) {
          clearInterval(intervalId);
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial call
    pollJobStatus();

    // Set up polling
    intervalId = setInterval(pollJobStatus, pollingInterval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId, pollingInterval]);

  return { jobStatus, loading, error };
}

// Hook for authentication
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(apiService.isAuthenticated());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.demoLogin();
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.clearToken();
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    login,
    logout,
    loading,
    error
  };
}

// Hook for creating and analyzing scenarios
export function useScenarioAnalysis() {
  const [currentJob, setCurrentJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createAndAnalyze = async (scenarioData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create scenario
      const scenario = await apiService.createScenario(scenarioData);
      
      // Start analysis
      const job = await apiService.analyzeScenario(scenario.id);
      setCurrentJob(job);
      
      return { scenario, job };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearJob = () => {
    setCurrentJob(null);
  };

  return {
    createAndAnalyze,
    currentJob,
    clearJob,
    loading,
    error
  };
}
