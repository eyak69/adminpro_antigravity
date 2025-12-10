import React from 'react';
import { Grid, Paper, Typography, Box, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';

const MarketOverview = ({ data }) => {
    if (!data || data.length === 0) return null;

    const getVariationIcon = (variationClass) => {
        if (variationClass === 'up') return <TrendingUpIcon fontSize="small" sx={{ color: 'success.main' }} />;
        if (variationClass === 'down') return <TrendingDownIcon fontSize="small" sx={{ color: 'error.main' }} />;
        return <RemoveIcon fontSize="small" sx={{ color: 'text.secondary' }} />;
    };

    const getVariationColor = (variationClass) => {
        if (variationClass === 'up') return 'success.light';
        if (variationClass === 'down') return 'error.light';
        return 'grey.100';
    };

    const formatCurrency = (val) => {
        if (val === null || val === undefined) return '-';
        return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(val);
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Cotizaciones en Tiempo Real
                <Chip label="Infobae" size="small" color="info" variant="outlined" />
            </Typography>
            <Grid container spacing={2}>
                {data.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: 4, borderColor: item.class_variation === 'up' ? 'success.main' : item.class_variation === 'down' ? 'error.main' : 'grey.300' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                    {item.title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: getVariationColor(item.class_variation), borderRadius: 1, px: 0.5 }}>
                                    {getVariationIcon(item.class_variation)}
                                    <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>
                                        {item.variation}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">Compra</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {item.compra !== null ? `$${formatCurrency(item.compra)}` : '-'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" color="text.secondary">Venta</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {item.venta !== null ? `$${formatCurrency(item.venta)}` : '-'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default MarketOverview;
