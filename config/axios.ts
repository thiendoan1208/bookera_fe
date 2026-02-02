import axios from "axios";

// Axios instance for Open Library API
const openLibraryInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_OPEN_LIBRARY_API_URL,
});

openLibraryInstance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

openLibraryInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Axios instance for Backend API
const backendInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor for backend
backendInstance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Add a response interceptor for backend
backendInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  },
);

export default openLibraryInstance;
export { backendInstance };
