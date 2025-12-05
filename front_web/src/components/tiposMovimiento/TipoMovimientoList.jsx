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
import TipoMovimientoService from '../../services/tipoMovimiento.service';
import TipoMovimientoForm from './TipoMovimientoForm';
import { useConfirm } from '../../context/ConfirmContext';

const TipoMovimientoList = () => {
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [selectedTipo, setSelectedTipo] = useState(null);
    const confirm = useConfirm();

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
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'nombre', headerName: 'Nombre' },
        { field: 'tipo_accion', headerName: 'Acción' },
        {
            field: 'operacion',
            headerName: 'Operación',
            valueGetter: (value, row) => row.operacion?.nombre || ''
        },
        {
            field: 'monedas_permitidas',
            headerName: 'Monedas',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', height: '100%', alignItems: 'center' }}>
                    {params.value?.map((m) => (
                        <Chip key={m.id} label={m.codigo} size="small" variant="outlined" />
                    ))}
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: '',
            width: 120,
            sortable: false,
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
