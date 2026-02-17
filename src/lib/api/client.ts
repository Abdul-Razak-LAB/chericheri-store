import type { ApiResponse } from '@/src/types';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Base API client with typed responses and error handling
 */
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make a fetch request with timeout and error handling
   */
  private async fetchWithTimeout(
    url: string,
    config: RequestConfig = {}
  ): Promise<Response> {
    const { timeout = DEFAULT_TIMEOUT, ...fetchConfig } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('TIMEOUT', 'Request timeout');
      }
      throw error;
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(path, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    return url.toString();
  }

  /**
   * Parse API response
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new ApiError(
        'INVALID_RESPONSE',
        'Expected JSON response',
        { contentType, text }
      );
    }

    const data = await response.json() as ApiResponse<T>;

    if (!response.ok) {
      throw new ApiError(
        data.success === false ? data.error.code : 'HTTP_ERROR',
        data.success === false ? data.error.message : `HTTP ${response.status}`,
        data.success === false ? data.error.details : undefined
      );
    }

    if (data.success === false) {
      throw new ApiError(
        data.error.code,
        data.error.message,
        data.error.details
      );
    }

    return data.data;
  }

  /**
   * GET request
   */
  async get<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...fetchConfig } = config;
    const url = this.buildUrl(`${this.baseUrl}${path}`, params);

    const response = await this.fetchWithTimeout(url, {
      ...fetchConfig,
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...fetchConfig.headers,
      },
    });

    return this.parseResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown, config: RequestConfig = {}): Promise<T> {
    const { params, ...fetchConfig } = config;
    const url = this.buildUrl(`${this.baseUrl}${path}`, params);

    const response = await this.fetchWithTimeout(url, {
      ...fetchConfig,
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        ...fetchConfig.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.parseResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: unknown, config: RequestConfig = {}): Promise<T> {
    const { params, ...fetchConfig } = config;
    const url = this.buildUrl(`${this.baseUrl}${path}`, params);

    const response = await this.fetchWithTimeout(url, {
      ...fetchConfig,
      method: 'PUT',
      headers: {
        ...this.defaultHeaders,
        ...fetchConfig.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.parseResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: unknown, config: RequestConfig = {}): Promise<T> {
    const { params, ...fetchConfig } = config;
    const url = this.buildUrl(`${this.baseUrl}${path}`, params);

    const response = await this.fetchWithTimeout(url, {
      ...fetchConfig,
      method: 'PATCH',
      headers: {
        ...this.defaultHeaders,
        ...fetchConfig.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.parseResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...fetchConfig } = config;
    const url = this.buildUrl(`${this.baseUrl}${path}`, params);

    const response = await this.fetchWithTimeout(url, {
      ...fetchConfig,
      method: 'DELETE',
      headers: {
        ...this.defaultHeaders,
        ...fetchConfig.headers,
      },
    });

    return this.parseResponse<T>(response);
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T>(
    path: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText) as ApiResponse<T>;
            if (response.success) {
              resolve(response.data);
            } else {
              reject(new ApiError(
                response.error.code,
                response.error.message,
                response.error.details
              ));
            }
          } catch (error) {
            reject(new ApiError('PARSE_ERROR', 'Failed to parse response'));
          }
        } else {
          reject(new ApiError('HTTP_ERROR', `HTTP ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiError('NETWORK_ERROR', 'Network request failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new ApiError('ABORTED', 'Upload aborted'));
      });

      xhr.open('POST', `${this.baseUrl}${path}`);
      xhr.send(formData);
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing/custom instances
export { ApiClient };
