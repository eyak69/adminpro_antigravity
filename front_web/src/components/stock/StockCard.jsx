
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Divider } from '@mui/material';
import stockCajaService from '../../services/stockCaja.service';

const StockCard = ({ refreshTrigger }) => {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadStock = async () => {
        try {
            const data = await stockCajaService.getAll();
            setStock(data);
            setLoading(false);
        } catch (error) {
            console.error("Error loading stock:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStock();
    }, [refreshTrigger]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={20} /></Box>;
    }

    return (
        <Card sx={{ mt: 3, mb: 3, border: '1px solid #e0e0e0', boxShadow: 1 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    📦 Stock en Caja
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (Actualizado al instante)
                    </Typography>
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={3}>
                    {stock.map((item) => (
                        <Grid item xs={12} sm={6} md={3} key={item.id}>
                            <Box sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'action.hover', // Unified light background for contrast
                                color: 'text.primary',
                                textAlign: 'center',
                                border: '1px solid',
                                borderColor: item.moneda?.es_nacional ? 'transparent' : 'primary.light' // Subtle hint for foreign
                            }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {item.moneda?.nombre} ({item.moneda?.codigo})
                                </Typography>
                                <Typography variant="h5" sx={{
                                    fontWeight: 'bold',
                                    color: Number(item.saldo_actual) < 0 ? 'error.main' : 'primary.main'
                                }}>
                                    $ {Number(item.saldo_actual).toLocaleString('es-AR', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                    {stock.length === 0 && (
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" align="center">
                                No hay saldos disponibles.
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default StockCard;
