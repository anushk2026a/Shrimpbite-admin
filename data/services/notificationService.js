import apiClient from "../api/apiClient";

const notificationService = {
    getNotifications: async () => {
        const res = await apiClient.get("/notifications");
        return res.data;
    },
    markAsRead: async (id) => {
        const res = await apiClient.patch(`/notifications/read/${id}`);
        return res.data;
    },
    markAllAsRead: async () => {
        const res = await apiClient.patch("/notifications/read-all");
        return res.data;
    }
};

export default notificationService;
