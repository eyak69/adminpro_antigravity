import axios from 'axios';
import config from '../config';

const { API_BASE_URL } = config;

const ParametroService = {
    getAll: async () => {
        const response = await axios.get(`${API_BASE_URL}/parametros`);
        return response.data;
    },

    get: async (clave) => {
        const response = await axios.get(`${API_BASE_URL}/parametros/${clave}`);
        return response.data;
    },

    create: async (data) => {
        const response = await axios.post(`${API_BASE_URL}/parametros`, data);
        return response.data;
    },

    update: async (clave, valor, descripcion) => {
        const response = await axios.put(`${API_BASE_URL}/parametros/${clave}`, {
            valor,
            descripcion
        });
        return response.data;
    },

    remove: async (clave) => {
        await axios.delete(`${API_BASE_URL}/parametros/${clave}`);
    }
};

export default ParametroService;
