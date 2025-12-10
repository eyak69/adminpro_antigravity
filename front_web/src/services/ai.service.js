import axios from 'axios';
import config from '../config';

const parse = async (text) => {
    const response = await axios.post(`${config.API_BASE_URL}/ai/parse`, { text });
    return response.data;
};

const analyze = async (data) => {
    const response = await axios.post(`${config.API_BASE_URL}/ai/analyze`, data);
    return response.data;
};

const classify = async (text) => {
    const response = await axios.post(`${config.API_BASE_URL}/ai/classify`, { text });
    return response.data;
};

export default {
    parse,
    analyze,
    classify
};
