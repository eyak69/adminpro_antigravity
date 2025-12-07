import axios from 'axios';
import config from '../config';

const API_URL = `${config.API_BASE_URL}/stock-caja`;

const getAll = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

const stockCajaService = {
    getAll,
    getById
};

export default stockCajaService;
