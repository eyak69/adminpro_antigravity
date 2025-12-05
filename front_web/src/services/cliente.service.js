import axios from 'axios';
import config from '../config';

const API_URL = `${config.API_BASE_URL}/clientes`;

const getAll = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

const getByAlias = async (alias) => {
    const response = await axios.get(`${API_URL}/alias/${alias}`);
    return response.data;
};

const create = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

const update = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

const remove = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export default {
    getAll,
    getById,
    getByAlias,
    create,
    update,
    remove,
};
