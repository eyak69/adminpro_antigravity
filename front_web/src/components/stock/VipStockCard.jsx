import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Divider } from '@mui/material';
import ctaCteService from '../../services/ctaCte.service';

const VipStockCard = ({ refreshTrigger }) => {
    const [saldos, setSaldos] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadSaldos = async () => {
        try {
            const data = await ctaCteService.getSaldosVip();
            setSaldos(data);
            setLoading(false);
        } catch (error) {
            console.error("Error loading VIP balances:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSaldos();
    }, [refreshTrigger]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={20} /></Box>;
    }

    return (
        <Card sx={{ mt: 3, mb: 3, border: '1px solid #e0e0e0', boxShadow: 1 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom color="secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    💎 Saldos VIP
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (Actualizado al instante)
                    </Typography>
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    {saldos.map((item) => (
                        <Grid item xs={12} sm={6} md={3} key={item.id}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'action.hover',
                                border: '1px solid',
                                borderColor: 'primary.light',
                                textAlign: 'center'
                            }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {item.cliente?.alias || item.cliente?.nombre_real}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    {item.moneda?.codigo}
                                </Typography>
                                <Typography variant="body1" sx={{
                                    fontWeight: 'bold',
                                    color: Number(item.saldo_actual) < 0 ? 'error.main' : 'primary.main'
                                }}>
                                    $ {Number(item.saldo_actual).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                    {saldos.length === 0 && (
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" align="center">
                                No hay saldos VIP activos.
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default VipStockCard;
