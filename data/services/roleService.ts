import apiClient from "../api/apiClient";

const roleService = {
    getRoles: async () => {
        const response = await apiClient.get("/roles");
        return response.data;
    },
    createRole: async (data: { name: string; modules: string[] }) => {
        const response = await apiClient.post("/roles", data);
        return response.data;
    },
    updateRole: async (id: string, data: { modules?: string[], isActive?: boolean }) => {
        const response = await apiClient.put(`/roles/${id}`, data);
        return response.data;
    },
    inviteAdmin: async (data: { name: string; email: string; roleId: string }) => {
        const response = await apiClient.post("/roles/invite", data);
        return response.data;
    },
    getAdmins: async () => {
        const response = await apiClient.get("/roles/admins");
        return response.data;
    },
    updateAdminRole: async (id: string, data: { roleId: string | null }) => {
        const response = await apiClient.put(`/roles/admins/${id}/role`, data);
        return response.data;
    }
};

export default roleService;
