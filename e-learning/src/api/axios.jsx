import axios from "axios";

const api = axios.create({
    // Vite va remplacer automatiquement cette variable par la bonne URL
    baseURL: import.meta.env.VITE_API_BASE_URL,

    headers: {
        Accept: "application/json",
    }
});

export default api;