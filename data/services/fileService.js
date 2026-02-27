import apiClient from "../api/apiClient";

const fileService = {
    upload: async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
};

export default fileService;
