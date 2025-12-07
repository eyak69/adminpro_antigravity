import { useState, useEffect } from 'react';
import { Grid, CircularProgress, Alert } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentsIcon from '@mui/icons-material/Payments';
import stockCajaService from '../../services/stockCaja.service';
import SummaryCard from '../cards/SummaryCard';

const StockGrid = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStock();
    }, []);

    const loadStock = async () => {
        try {
            const data = await stockCajaService.getAll();
            setStocks(data);
            setLoading(false);
        } catch (err) {
            console.error("Error loading stock:", err);
            setError("No se pudo cargar el stock de caja.");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Grid container justifyContent="center" sx={{ p: 2 }}>
                <CircularProgress />
            </Grid>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        );
    }

    return (
        <Grid container spacing={3}>
            {stocks.map((stock) => {
                const isPositive = parseFloat(stock.saldo_actual) >= 0;
                const isNational = stock.moneda?.es_nacional;
                const icon = isNational ? <PaymentsIcon /> : <AttachMoneyIcon />;
                const color = isNational ? 'success' : 'primary'; // Use different base colors for variety if desired, or keep logic simple

                return (
                    <Grid item xs={12} sm={6} md={3} key={stock.id}>
                        <SummaryCard
                            title={`Stock ${stock.moneda?.nombre}`}
                            value={`${stock.moneda?.codigo} ${parseFloat(stock.saldo_actual).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                            // trend={isPositive ? "up" : "down"} // Optional: Show trend based on recent movs? Not available yet.
                            // trendValue={isPositive ? "Positivo" : "Negativo"}
                            icon={icon}
                            color={color}
                        />
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default StockGrid;
