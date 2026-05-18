import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Queue for failed requests while token is refreshing
let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      
      if (isRefreshing) {
        // If already refreshing, put the request in a queue
        try {
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token using HttpOnly cookie automatically
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL ?? "/api/v1"}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        processQueue(null, 'Refreshed');
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Dispatch event or clear store to force logout if refresh fails entirely
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("auth_session_expired"));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
