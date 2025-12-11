import api from './api';

const getDailyBalance = async (date) => {
    // If no date provided, backend usually defaults to today or we send today.
    // Web version sends selectedDate.
    // For mobile dashboard default to today.
    let dateStr = date;
    if (!dateStr) {
        // Fix: Use local time, not UTC (toISOString is UTC)
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        const localDate = new Date(d.getTime() - offset);
        dateStr = localDate.toISOString().split('T')[0];
    }
    // Fix: Endpoint is /day-balance not /balance-diario
    const response = await api.get(`/planillas/day-balance?date=${dateStr}`);
    return response.data;
};

const getHistoricalBalance = async (date) => {
    let dateStr = date;
    if (!dateStr) {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        const localDate = new Date(d.getTime() - offset);
        dateStr = localDate.toISOString().split('T')[0];
    }
    const response = await api.get(`/planillas/balance?date=${dateStr}`);
    return response.data;
};

export default {
    getDailyBalance,
    getHistoricalBalance
};
