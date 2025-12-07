import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import StockGrid from '../components/dashboard/StockGrid';

const DashboardHome = () => {
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

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Stock Grid Section */}
                <Grid item xs={12}>
                    <StockGrid />
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardHome;
