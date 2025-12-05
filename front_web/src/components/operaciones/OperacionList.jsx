import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    IconButton,
    Tooltip
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OperacionService from '../../services/operacion.service';
import OperacionForm from './OperacionForm';
import { useConfirm } from '../../context/ConfirmContext';

const OperacionList = () => {
    const [operaciones, setOperaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [selectedOperacion, setSelectedOperacion] = useState(null);
    const confirm = useConfirm();

    const fetchOperaciones = async () => {
        setLoading(true);
        try {
            const data = await OperacionService.getAll();
            setOperaciones(data);
        } catch (error) {
            console.error('Error fetching operaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOperaciones();
    }, []);

    const handleCreate = () => {
        setSelectedOperacion(null);
        setOpenForm(true);
    };

    const handleEdit = (operacion) => {
        setSelectedOperacion(operacion);
        setOpenForm(true);
    };

    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Eliminar Operación',
            message: '¿Estás seguro de que deseas eliminar esta operación? Esta acción no se puede deshacer.'
        });

        if (isConfirmed) {
            try {
                await OperacionService.remove(id);
                fetchOperaciones();
            } catch (error) {
                console.error('Error deleting operacion:', error);
            }
        }
    };

    const handleFormSubmit = async (data) => {
        try {
            if (selectedOperacion) {
                await OperacionService.update(selectedOperacion.id, data);
            } else {
                await OperacionService.create(data);
            }
            setOpenForm(false);
            fetchOperaciones();
        } catch (error) {
            console.error('Error saving operacion:', error);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'nombre', headerName: 'Nombre', flex: 1 },
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
                    Operaciones
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Nueva Operación
                </Button>
            </Box>

            {!loading && (
                <DataGrid
                    rows={operaciones}
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

            <OperacionForm
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedOperacion}
            />
        </Paper>
    );
};

export default OperacionList;
