import React from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';

const SummaryCard = ({ title, value, trend, trendValue, icon, color }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        bgcolor: `${color}.light`,
                        color: 'white',
                        background: (theme) => `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
                        boxShadow: (theme) => `0 4px 20px 0 ${theme.palette[color].main}40`
                    }}
                >
                    {icon}
                </Box>
                {trend && (
                    <Chip
                        icon={trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        label={trendValue}
                        color={trend === 'up' ? 'success' : 'error'}
                        size="small"
                        variant="soft"
                        sx={{ fontWeight: 'bold' }}
                    />
                )}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
        </CardContent>
    </Card>
);

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
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard
                        title="Ingresos Totales"
                        value="$24,500"
                        trend="up"
                        trendValue="+12%"
                        icon={<AttachMoneyIcon />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard
                        title="Nuevos Clientes"
                        value="45"
                        trend="up"
                        trendValue="+5%"
                        icon={<PeopleIcon />}
                        color="secondary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard
                        title="Gastos"
                        value="$8,200"
                        trend="down"
                        trendValue="-2%"
                        icon={<TrendingDownIcon />}
                        color="error"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard
                        title="Beneficio Neto"
                        value="$16,300"
                        trend="up"
                        trendValue="+18%"
                        icon={<TrendingUpIcon />}
                        color="success"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Resumen de Ventas</Typography>
                        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography color="text.secondary">Gráfico de Ventas (Placeholder)</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Actividad Reciente</Typography>
                        {/* Placeholder for activity list */}
                        {[1, 2, 3, 4].map((i) => (
                            <Box key={i} sx={{ mb: 2, pb: 2, borderBottom: i < 4 ? '1px solid #f0f0f0' : 'none' }}>
                                <Typography variant="subtitle2">Nueva venta registrada</Typography>
                                <Typography variant="caption" color="text.secondary">Hace {i * 15} minutos</Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardHome;
