import apiClient from "../api/apiClient";

const authService = {
    login: async (credentials) => {
        const response = await apiClient.post("/auth/login", credentials);
        return response.data;
    },

    register: async (userData) => {
        const response = await apiClient.post("/auth/register", userData);
        return response.data;
    },

    getMe: async (id) => {
        const response = await apiClient.get(`/auth/me/${id}`);
        return response.data;
    },

    updateOnboarding: async (data) => {
        const response = await apiClient.put("/auth/onboarding", data);
        return response.data;
    }
};

export default authService;
