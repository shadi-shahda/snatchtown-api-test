// api-handler.js

const axios = require('axios');  // Or 'import axios from "axios";' for ES modules

const baseUrl = '';

class ApiHandler {
  constructor(config = {}) {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers
    };
    if (config.authToken) {
      this.defaultHeaders['Authorization'] = `Bearer ${config.authToken}`;
    }
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: this.defaultHeaders
    });

    // Retry interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.code === 'ECONNABORTED' || (error.response?.status > 500 && !originalRequest._retry)) {
          originalRequest._retry = true;
          console.warn(`Retrying request to ${originalRequest.url}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.axiosInstance(originalRequest);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic request method - Returns { success, data/error, status } (unchanged).
   */
  async request(endpoint, method = 'GET', body = null, customHeaders = {}, queryParams = {}) {
    const config = {
      method: method.toUpperCase(),
      headers: { ...this.defaultHeaders, ...customHeaders },
      params: queryParams,
      data: body ? (typeof body === 'object' ? body : JSON.stringify(body)) : undefined
    };


    try {
      const response = await this.axiosInstance(`${endpoint}`, config);
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.log(error.response.data.errors);

      const errorMessage = error.response?.statusText || error.message || 'Unknown error';
      console.log('errorMessage: ', errorMessage);

      const errorStatus = error.response?.status || 0;
      const errorDetails = error.response?.data || null;

      return {
        success: false,
        error: errorMessage,
        status: errorStatus,
        data: errorDetails
      };
    }
  }

  // Convenience methods (unchanged)
  async get(endpoint, queryParams = {}, customHeaders = {}) {
    return this.request(endpoint, 'GET', null, customHeaders, queryParams);
  }

  async post(endpoint, body, customHeaders = {}) {
    return this.request(endpoint, 'POST', body, customHeaders);
  }

  async put(endpoint, body, customHeaders = {}) {
    return this.request(endpoint, 'PUT', body, customHeaders);
  }

  async patch(endpoint, body, customHeaders = {}) {
    return this.request(endpoint, 'PATCH', body, customHeaders);
  }

  async delete(endpoint, customHeaders = {}) {
    return this.request(endpoint, 'DELETE', null, customHeaders);
  }
}

module.exports = ApiHandler;
