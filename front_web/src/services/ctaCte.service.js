import axios from 'axios';
import config from '../config';

const getMovimientos = async (clienteId) => {
    const response = await axios.get(`${config.API_BASE_URL}/cta-cte/movimientos/${clienteId}`);
    return response.data;
};

const getSaldo = async (clienteId, monedaId) => {
    const response = await axios.get(`${config.API_BASE_URL}/cta-cte/saldo/${clienteId}/${monedaId}`);
    return response.data;
};

export default {
    getMovimientos,
    getSaldo
};
