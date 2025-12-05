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
import MonedaService from '../../services/moneda.service';
import MonedaForm from './MonedaForm';
import { useConfirm } from '../../context/ConfirmContext';

const MonedaList = () => {
    const [monedas, setMonedas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [selectedMoneda, setSelectedMoneda] = useState(null);
    const confirm = useConfirm();

    const fetchMonedas = async () => {
        setLoading(true);
        try {
            const data = await MonedaService.getAll();
            setMonedas(data);
        } catch (error) {
            console.error('Error fetching monedas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonedas();
    }, []);

    const handleCreate = () => {
        setSelectedMoneda(null);
        setOpenForm(true);
    };

    const handleEdit = (moneda) => {
        setSelectedMoneda(moneda);
        setOpenForm(true);
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Eliminar Moneda',
            message: '¿Estás seguro de que deseas eliminar esta moneda? Esta acción no se puede deshacer.'
        });

        if (isConfirmed) {
            try {
                await MonedaService.remove(id);
                fetchMonedas();
            } catch (error) {
                console.error('Error deleting moneda:', error);
            }
        }
    };

    const handleFormSubmit = async (data) => {
        try {
            if (selectedMoneda) {
                await MonedaService.update(selectedMoneda.id, data);
            } else {
                await MonedaService.create(data);
            }
            setOpenForm(false);
            fetchMonedas();
        } catch (error) {
            console.error('Error saving moneda:', error);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'codigo', headerName: 'Código', width: 100 },
        { field: 'nombre', headerName: 'Nombre', flex: 1 },
        { field: 'simbolo', headerName: 'Símbolo', width: 100 },
        {
            field: 'es_nacional',
            headerName: 'Nacional',
            width: 120,
            renderCell: (params) => (
                params.value ? <Chip label="Sí" color="primary" size="small" variant="outlined" /> : <Chip label="No" size="small" variant="outlined" />
            )
        },
        {
            field: 'activa',
            headerName: 'Activa',
            width: 120,
            renderCell: (params) => (
                params.value ? <Chip label="Activa" color="success" size="small" /> : <Chip label="Inactiva" color="default" size="small" />
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
                    Monedas
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Nueva Moneda
                </Button>
            </Box>

            {!loading && (
                <DataGrid
                    rows={monedas}
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

            <MonedaForm
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedMoneda}
            />
        </Paper>
    );
};

export default MonedaList;
