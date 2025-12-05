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
import ClienteService from '../../services/cliente.service';
import ClienteForm from './ClienteForm';
import { useConfirm } from '../../context/ConfirmContext';

const ClienteList = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const confirm = useConfirm();

    const fetchClientes = async () => {
        setLoading(true);
        try {
            const data = await ClienteService.getAll();
            setClientes(data);
        } catch (error) {
            console.error('Error fetching clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleCreate = () => {
        setSelectedCliente(null);
        setOpenForm(true);
    };

    const handleEdit = (cliente) => {
        setSelectedCliente(cliente);
        setOpenForm(true);
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Eliminar Cliente',
            message: '¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.'
        });

        if (isConfirmed) {
            try {
                await ClienteService.remove(id);
                fetchClientes();
            } catch (error) {
                console.error('Error deleting cliente:', error);
            }
        }
    };

    const handleFormSubmit = async (data) => {
        try {
            if (selectedCliente) {
                await ClienteService.update(selectedCliente.id, data);
            } else {
                await ClienteService.create(data);
            }
            setOpenForm(false);
            fetchClientes();
        } catch (error) {
            console.error('Error saving cliente:', error);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'alias', headerName: 'Alias' },
        { field: 'nombre_real', headerName: 'Nombre Real' },
        { field: 'documento', headerName: 'Documento' },
        {
            field: 'es_moroso',
            headerName: 'Moroso',
            width: 100,
            renderCell: (params) => (
                params.value ?
                    <Chip label="Sí" color="error" size="small" variant="outlined" /> :
                    <Chip label="No" color="success" size="small" variant="outlined" />
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
                    Clientes
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Nuevo Cliente
                </Button>
            </Box>

            {!loading && (
                <DataGrid
                    rows={clientes}
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

            <ClienteForm
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedCliente}
            />
        </Paper>
    );
};

export default ClienteList;
