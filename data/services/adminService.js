import apiClient from "../api/apiClient";

const adminService = {
    getRetailers: async (status = "under_review") => {
        const response = await apiClient.get("/admin/retailers", {
            params: { status }
        });
        return response.data;
    },

    updateRetailerStatus: async (userId, status, rejectionReason = "") => {
        const response = await apiClient.put("/admin/retailers/status", {
            userId,
            status,
            rejectionReason
        });
        return response.data;
    }
};

export default adminService;
