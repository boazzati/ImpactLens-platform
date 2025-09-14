// API Service Layer for ImpactLens Platform
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('impactlens_token');
  }

  // Helper method to make authenticated requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication
  async demoLogin() {
    try {
      const response = await this.request('/auth/demo-login', {
        method: 'POST',
      });
      
      if (response.access_token) {
        this.token = response.access_token;
        localStorage.setItem('impactlens_token', this.token);
      }
      
      return response;
    } catch (error) {
      console.error('Demo login failed:', error);
      throw error;
    }
  }

  // Scenarios
  async createScenario(scenarioData) {
    return this.request('/scenarios', {
      method: 'POST',
      body: JSON.stringify({
        brand_a: scenarioData.brandA,
        brand_b: scenarioData.brandB,
        partnership_type: scenarioData.partnershipType,
        target_audience: scenarioData.targetAudience,
        budget_range: scenarioData.budget,
      }),
    });
  }

  async getScenarios() {
    return this.request('/scenarios');
  }

  async getScenario(scenarioId) {
    return this.request(`/scenarios/${scenarioId}`);
  }

  async analyzeScenario(scenarioId) {
    return this.request(`/scenarios/${scenarioId}/analyze`, {
      method: 'POST',
    });
  }

  // Jobs
  async getJobStatus(jobId) {
    return this.request(`/jobs/${jobId}`);
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Partner Suggestions
  async getPartnerSuggestions(brandName, industry = null) {
    return this.request('/partner-suggestions', {
      method: 'POST',
      body: JSON.stringify({
        brand_name: brandName,
        industry: industry,
      }),
    });
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }

  // Utility methods
  setToken(token) {
    this.token = token;
    localStorage.setItem('impactlens_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('impactlens_token');
  }

  isAuthenticated() {
    return !!this.token;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
