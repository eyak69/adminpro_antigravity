import axios from 'axios';
import config from '../config';

const API_URL = `${config.API_BASE_URL}/planillas`;
const TRANSACTION_URL = `${config.API_BASE_URL}/transactions`;

const getAll = async (params) => {
    const response = await axios.get(API_URL, { params });
    return response.data;
};

const getById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

// Create uses the TransactionService to ensure integrity
const create = async (data) => {
    const response = await axios.post(TRANSACTION_URL, data);
    return response.data;
};

// Update is restricted to non-financial fields on the backend usually, calling standard endpoint
const update = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

// Remove triggers 'anular' transaction logic
const remove = async (id) => {
    // Payload matches what TransactionController.anularTransaccion expects POST /:id
    const response = await axios.post(`${TRANSACTION_URL}/anular/${id}`);
    return response.data;
};

const getLastCotizacion = async (monedaId, tipoAccion) => {
    const params = {};
    if (tipoAccion) params.accion = tipoAccion;
    const response = await axios.get(`${API_URL}/last-cotizacion/${monedaId}`, { params });
    return response.data.cotizacion; // Access .cotizacion property from response object
};

export default {
    getAll,
    getById,
    create,
    update,
    remove,
    getLastCotizacion,
};
