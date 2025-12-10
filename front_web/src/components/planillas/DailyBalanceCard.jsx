
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Divider } from '@mui/material';
import planillaService from '../../services/planilla.service';

const DailyBalanceCard = ({ selectedDate, refreshTrigger }) => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadBalances = async () => {
        setLoading(true);
        try {
            const data = await planillaService.getDailyBalance(selectedDate);
            setBalances(data);
        } catch (error) {
            console.error("Error loading daily balances:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBalances();
    }, [selectedDate, refreshTrigger]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={20} /></Box>;
    }

    return (
        <Card sx={{ mt: 3, mb: 3, border: '1px solid #e0e0e0', boxShadow: 1, backgroundColor: '#f9fafb' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    📅 Saldo al Corte
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (Calculado al final del día {selectedDate})
                    </Typography>
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={3}>
                    {balances.map((item) => (
                        <Grid item xs={12} sm={6} md={3} key={item.moneda.id}>
                            <Box sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'white',
                                color: 'text.primary',
                                textAlign: 'center',
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
                            }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {item.moneda.nombre} ({item.moneda.codigo})
                                </Typography>
                                <Typography variant="h5" sx={{
                                    fontWeight: 'bold',
                                    color: Number(item.saldo) < 0 ? 'error.main' : 'success.main'
                                }}>
                                    $ {Number(item.saldo).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                    {balances && balances.error && (
                        <Grid item xs={12}>
                            <Typography variant="body2" color="error" align="center">
                                Error: {balances.error}
                            </Typography>
                        </Grid>
                    )}
                    {(!balances || balances.length === 0) && !loading && (
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" align="center">
                                No se encontraron datos.
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default DailyBalanceCard;
