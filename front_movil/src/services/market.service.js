import api from './api';

const getMarketRates = async () => {
    const response = await api.get('/dolar/scrape');
    return response.data;
};

export default {
    getMarketRates
};
