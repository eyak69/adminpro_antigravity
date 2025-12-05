import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import Swal from 'sweetalert2';
import ParametroService from '../services/parametro.service';
import { useParametros } from '../context/ParametrosContext';

const ConfiguracionPage = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const { refreshParametros } = useParametros();

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const data = await ParametroService.get('COLORESOPERACIONES');
            if (data && data.themeConfig) {
                setConfig(data.themeConfig);
            }
        } catch (error) {
            console.error('Error loading config:', error);
            Swal.fire('Error', 'No se pudo cargar la configuración', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, field, value) => {
        setConfig(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        try {
            await ParametroService.update('COLORESOPERACIONES', { themeConfig: config });
            await refreshParametros(); // Update Context to reflect changes immediately
            Swal.fire('Guardado', 'La configuración se actualizó correctamente', 'success');
        } catch (error) {
            console.error('Error saving config:', error);
            Swal.fire('Error', 'No se pudo guardar la configuración', 'error');
        }
    };

    if (loading) return <Typography>Cargando configuración...</Typography>;
    if (!config) return <Typography>No hay configuración disponible.</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Configuración de Colores</Typography>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                >
                    Guardar Cambios
                </Button>
            </Box>

            <Grid container spacing={3}>
                {Object.keys(config).map((key) => {
                    const item = config[key];
                    return (
                        <Grid item xs={12} md={6} lg={4} key={key}>
                            <Card elevation={3}>
                                <CardHeader
                                    title={key}
                                    subheader={item.descripcion}
                                    titleTypographyProps={{ variant: 'h6' }}
                                    sx={{
                                        bgcolor: item.rowColor || 'transparent',
                                        color: item.textColor || 'text.primary',
                                        borderBottom: 1,
                                        borderColor: 'divider'
                                    }}
                                />
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Descripción"
                                                value={item.descripcion || ''}
                                                onChange={(e) => handleChange(key, 'descripcion', e.target.value)}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                Color de Texto
                                            </Typography>
                                            <input
                                                type="color"
                                                value={item.textColor || '#000000'}
                                                onChange={(e) => handleChange(key, 'textColor', e.target.value)}
                                                style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                                            />
                                            <Typography variant="caption">{item.textColor}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" display="block" gutterBottom>
                                                Color de Fila (Fondo)
                                            </Typography>
                                            <input
                                                type="color"
                                                value={item.rowColor || '#ffffff'}
                                                onChange={(e) => handleChange(key, 'rowColor', e.target.value)}
                                                style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                                            />
                                            <Typography variant="caption">{item.rowColor}</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default ConfiguracionPage;
