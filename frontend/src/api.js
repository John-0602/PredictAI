const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      let errorMsg = `Server error ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson.detail) errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      } catch (e) {
        // Fallback text
      }
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  baseUrl: API_BASE_URL,
  
  // Dashboard
  getDashboardStats: () => apiRequest('/api/dashboard/stats'),

  // Prediction
  predictFailure: (data) => apiRequest('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  predictBatch: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/api/predict/batch`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Batch processing failed');
    }
    return await res.json();
  },

  // Dataset
  getDatasetSummary: () => apiRequest('/api/dataset/summary'),
  getDatasetPreview: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/dataset/preview?${query}`);
  },
  getDatasetDownloadUrl: () => `${API_BASE_URL}/api/dataset/download`,

  // EDA
  getEdaDistributions: () => apiRequest('/api/eda/distributions'),
  getEdaCorrelations: () => apiRequest('/api/eda/correlations'),
  getEdaScatter: (sampleSize = 400) => apiRequest(`/api/eda/scatter?sample_size=${sampleSize}`),

  // Models & Evaluation
  getModelComparison: () => apiRequest('/api/models/comparison'),
  getActiveModel: () => apiRequest('/api/models/active'),
  switchActiveModel: (modelName) => apiRequest('/api/models/active', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_name: modelName }),
  }),

  // Explainability
  getGlobalExplainability: () => apiRequest('/api/explainability/global'),
  getLocalExplainability: (data) => apiRequest('/api/explainability/local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  getDomainInsights: () => apiRequest('/api/explainability/insights'),

  // Maintenance
  getMaintenanceTasks: () => apiRequest('/api/maintenance/tasks'),
  createMaintenanceTask: (task) => apiRequest('/api/maintenance/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  }),
  updateMaintenanceTask: (taskId, updates) => apiRequest(`/api/maintenance/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }),
  deleteMaintenanceTask: (taskId) => apiRequest(`/api/maintenance/tasks/${taskId}`, {
    method: 'DELETE',
  }),
  getMaintenanceRecommendations: () => apiRequest('/api/maintenance/recommendations'),

  // History
  getPredictionHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/history?${query}`);
  },
  deletePrediction: (predId) => apiRequest(`/api/history/${predId}`, {
    method: 'DELETE',
  }),
  clearHistory: () => apiRequest('/api/history', {
    method: 'DELETE',
  }),
  getExportHistoryUrl: () => `${API_BASE_URL}/api/history/export`,
};
