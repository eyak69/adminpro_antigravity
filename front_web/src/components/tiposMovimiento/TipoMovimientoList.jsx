import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    IconButton,
    Tooltip,
    Chip
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import TipoMovimientoService from '../../services/tipoMovimiento.service';
import TipoMovimientoForm from './TipoMovimientoForm';
import { useConfirm } from '../../context/ConfirmContext';
import { useNotification } from '../../context/NotificationContext';
import { useParametros } from '../../context/ParametrosContext';

const TipoMovimientoList = () => {
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [selectedTipo, setSelectedTipo] = useState(null);
    const confirm = useConfirm();
    const { addNotification } = useNotification();

    const fetchTipos = async () => {
        setLoading(true);
        try {
            const data = await TipoMovimientoService.getAll();
            setTipos(data);
        } catch (error) {
            console.error('Error fetching tipos movimiento:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTipos();
    }, []);

    const handleCreate = () => {
        setSelectedTipo(null);
        setOpenForm(true);
    };

    const handleEdit = (tipo) => {
        setSelectedTipo(tipo);
        setOpenForm(true);
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Eliminar Tipo de Movimiento',
            message: '¿Estás seguro de que deseas eliminar este tipo de movimiento? Esta acción no se puede deshacer.'
        });

        if (isConfirmed) {
            try {
                await TipoMovimientoService.remove(id);
                fetchTipos();
            } catch (error) {
                console.error('Error deleting tipo movimiento:', error);
            }
        }
    };

    const handleFormSubmit = async (data) => {
        try {
            if (selectedTipo) {
                await TipoMovimientoService.update(selectedTipo.id, data);
            } else {
                await TipoMovimientoService.create(data);
            }
            setOpenForm(false);
            fetchTipos();
        } catch (error) {
            console.error('Error saving tipo movimiento:', error);
            const message = error.response?.data?.message || 'Ocurrió un error al guardar el tipo de movimiento.';

            // Log to system via context (persists to backend)
            addNotification('error', message);

            Swal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: message
            });
        }
    };

    const { parametros, getCellColor, getRowTheme } = useParametros();

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 70,
            type: 'number',
            headerAlign: 'left',
            align: 'left'
        },
        {
            field: 'nombre',
            headerName: 'Nombre',
            flex: 2,
            minWidth: 200
        },
        {
            field: 'tipo_accion',
            headerName: 'Acción',
            width: 120,
            type: 'singleSelect',
            valueOptions: ['COMPRA', 'VENTA', 'ENTRADA', 'SALIDA'],
            renderCell: (params) => {
                if (!params.value) return '';
                const color = getCellColor(params.value);
                return (
                    <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{ color: color }}
                    >
                        {params.value}
                    </Typography>
                );
            }
        },
        {
            field: 'contabilizacion',
            headerName: 'Contab.',
            width: 100,
            type: 'singleSelect',
            valueOptions: ['ENTRADA', 'SALIDA'],
            renderCell: (params) => {
                if (!params.value) return '';
                const color = getCellColor(params.value);
                return (
                    <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{ color: color }}
                    >
                        {params.value}
                    </Typography>
                );
            }
        },
        {
            field: 'operacion',
            headerName: 'Operación',
            flex: 1.5,
            minWidth: 150,
            valueGetter: (value, row) => row.operacion?.nombre || ''
        },
        {
            field: 'monedas_permitidas',
            headerName: 'Monedas',
            flex: 1,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', height: '100%', alignItems: 'center' }}>
                    {params.value?.map((m) => (
                        <Chip
                            key={m.id}
                            label={m.codigo}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: 'divider', bgcolor: 'background.paper' }}
                        />
                    ))}
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: '',
            width: 120,
            sortable: false,
            filterable: false,
            hideable: false,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="Editar">
                        <IconButton onClick={() => handleEdit(params.row)} size="small" color="primary">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton onClick={() => handleDelete(params.row.id)} size="small" color="error">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Paper sx={{ p: 2, height: 'calc(100vh - 140px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h2">
                    Tipos de Movimiento
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Nuevo Tipo
                </Button>
            </Box>

            {!loading && (
                <DataGrid
                    rows={tipos}
                    columns={columns}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                            quickFilterProps: { debounceMs: 500 },
                        },
                    }}
                    disableRowSelectionOnClick
                    autosizeOnMount
                    getRowClassName={(params) => {
                        const theme = parametros.themeConfig || {};
                        const { tipo_accion, contabilizacion } = params.row;

                        // 1. Detect Cruzado: Intercambio (Compra+Salida or Venta+Entrada)
                        if ((tipo_accion === 'COMPRA' && contabilizacion === 'SALIDA') ||
                            (tipo_accion === 'VENTA' && contabilizacion === 'ENTRADA')) {
                            return 'row-CRUZADO';
                        }

                        // 2. Normal Mapping
                        if (tipo_accion && theme[tipo_accion]) return `row-${tipo_accion}`;
                        if (contabilizacion && theme[contabilizacion]) return `row-${contabilizacion}`;

                        return '';
                    }}
                    sx={{
                        // Dynamic Styles Generation
                        ...((parametros.themeConfig) ? Object.keys(parametros.themeConfig).reduce((acc, key) => {
                            const conf = parametros.themeConfig[key];
                            if (conf.rowColor) {
                                acc[`& .row-${key}`] = {
                                    bgcolor: conf.rowColor,
                                    '&:hover': { bgcolor: conf.rowColor } // Simplification
                                };
                            }
                            return acc;
                        }, {}) : {})
                    }}
                />
            )}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <Typography>Cargando...</Typography>
                </Box>
            )}

            <TipoMovimientoForm
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedTipo}
            />
        </Paper>
    );
};

export default TipoMovimientoList;
