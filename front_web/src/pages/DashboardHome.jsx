import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import StockGrid from '../components/dashboard/StockGrid';
import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import LineChart from '../components/dashboard/LineChart';
import MarketOverview from '../components/dashboard/MarketOverview';

const DashboardHome = () => {
    const [rates, setRates] = useState([]);
    const [marketData, setMarketData] = useState([]);

    useEffect(() => {
        const fetchRates = async () => {
            // MOCK DATA FOR DEMO
            const mockRates = [];
            const today = new Date();
            let baseCompra = 1120;
            let baseVenta = 1150;

            for (let i = 30; i >= 0; i--) {
                const day = new Date(today);
                day.setDate(today.getDate() - i);

                // Random flux
                baseCompra += (Math.random() - 0.5) * 10;
                baseVenta += (Math.random() - 0.5) * 10;

                mockRates.push({
                    fecha: day.toISOString().split('T')[0],
                    compra: Number(baseCompra.toFixed(2)),
                    venta: Number(baseVenta.toFixed(2))
                });
            }
            setRates(mockRates);

            /* API DISABLED FOR DEMO
            try {
                // Fetch USD rates (monedaId=2) for last 30 days
                const res = await axios.get(`${config.API_BASE_URL}/planillas/rates?days=30&monedaId=2`);
                setRates(res.data);
            } catch (error) {
                console.error("Error loading rates", error);
            }
            */
        };

        const fetchMarketData = async () => {
            try {
                const res = await axios.get(`${config.API_BASE_URL}/dolar/scrape`);
                setMarketData(res.data);
            } catch (error) {
                console.error("Error loading market data", error);
            }
        };

        fetchRates();
        fetchMarketData();
    }, []);
    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>
                    Bienvenido de nuevo, Cristian 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Aquí tienes un resumen de lo que está pasando hoy.
                </Typography>
            </Box>

            {/* Market Overview Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12 }}>
                    <MarketOverview data={marketData} />
                </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <LineChart data={rates} title="Evolución Dólar (Últimos 30 días)" />
                </Grid>
                {/* Placeholder for future cards */}
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Stock Grid Section */}
                {/* Stock Grid Section */}
                <Grid size={{ xs: 12 }}>
                    <StockGrid />
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardHome;
