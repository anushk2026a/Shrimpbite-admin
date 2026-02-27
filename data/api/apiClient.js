import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",

    // baseURL: process.env.NEXT_PUBLIC_API_URL || "https://shrimpbite-backend.vercel.app/api",
    headers: {
        "Content-Type": "application/json",
    },
});


// Add a request interceptor to include the JWT token
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - maybe clear store/localStorage
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                // window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
