import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Paper, Divider, Skeleton, Alert, Box } from '@mui/material';
import planillaService from '../../services/planilla.service';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const DailyMovementCard = ({ selectedDate, refreshTrigger }) => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await planillaService.getDailyMovements(selectedDate);
                setBalances(data);
            } catch (err) {
                console.error("Error fetching daily movements", err);
                setError("No se pudieron cargar los movimientos diarios.");
            } finally {
                setLoading(false);
            }
        };

        if (selectedDate) {
            fetchBalance();
        }
    }, [selectedDate, refreshTrigger]);

    if (!selectedDate) return null;

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        );
    }

    if (!loading && balances.length === 0) {
        return null; // Don't show if empty
    }

    return (
        <Card elevation={3} sx={{ mb: 3, borderLeft: '6px solid #ff9800' }}> {/* Different color (Orange) to distinguish */}
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarTodayIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                        Movimientos del Día <Typography component="span" variant="body2" color="text.secondary">(Solo operaciones de hoy)</Typography>
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={3}>
                    {loading ? (
                        Array.from(new Array(3)).map((_, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                            </Grid>
                        ))
                    ) : (
                        balances.map((item) => (
                            <Grid item xs={12} sm={6} md={3} key={item.moneda.id}>
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        borderRadius: 3,
                                        border: `1px solid #ff9800`,
                                        bgcolor: 'rgba(255, 152, 0, 0.05)'
                                    }}
                                >
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {item.moneda.nombre} ({item.moneda.codigo})
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        component="div"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: item.saldo >= 0 ? 'success.main' : 'error.main'
                                        }}
                                    >
                                        $ {item.saldo.toLocaleString('es-AR', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default DailyMovementCard;
