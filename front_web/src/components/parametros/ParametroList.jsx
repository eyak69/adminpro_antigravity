import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    Tooltip
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import axios from 'axios';
import config from '../../config'; // Adjust path if needed

import ParametroService from '../../services/parametro.service';
import ParametroForm from './ParametroForm';
import { useConfirm } from '../../context/ConfirmContext';
import { useNotification } from '../../context/NotificationContext';

const ParametroList = () => {
    const [parametros, setParametros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [selectedParametro, setSelectedParametro] = useState(null);
    const confirm = useConfirm();
    const { addNotification } = useNotification();

    const fetchParametros = async () => {
        setLoading(true);
        try {
            const data = await ParametroService.getAll();
            // DataGrid needs 'id'
            const rows = data.map(p => ({ ...p, id: p.clave }));
            setParametros(rows);
        } catch (error) {
            console.error('Error fetching parametros:', error);
            addNotification('error', 'Error al cargar parámetros');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParametros();
    }, []);

    const handleCreate = () => {
        setSelectedParametro(null);
        setOpenForm(true);
    };

    const handleEdit = (parametro) => {
        setSelectedParametro(parametro);
        setOpenForm(true);
    };

    const handleDelete = async (clave) => {
        const isConfirmed = await confirm({
            title: 'Eliminar Parámetro',
            message: `¿Estás seguro de que deseas eliminar el parámetro "${clave}"? Esto puede afectar el sistema.`
        });

        if (isConfirmed) {
            try {
                await ParametroService.remove(clave);
                addNotification('success', 'Parámetro eliminado');
                fetchParametros();
            } catch (error) {
                console.error('Error deleting parametro:', error);
                addNotification('error', 'Error al eliminar parámetro');
            }
        }
    };

    const handleFormSubmit = () => {
        setOpenForm(false);
        fetchParametros();
    };



    const handleRestoreDefaults = async () => {
        const isConfirmed = await confirm({
            title: 'Restaurar Parámetros Default',
            message: '¿Desea restaurar los parámetros por defecto? Esto verificará y creará cualquier configuración base faltante (Colores, Control Saldo, etc).'
        });

        if (isConfirmed) {
            try {
                // Assuming ParametroService or generic axios call
                // Since ParametroService usually has generic methods, let's just use axios for this custom endpoint or add it to service.
                // Using axios directly for speed, or better: extend service. 
                // Let's use axios for now as imported.
                await axios.post(`${config.API_BASE_URL}/parametros/defaults`);

                addNotification('success', 'Parámetros verificados/restaurados.');
                fetchParametros();
            } catch (error) {
                console.error('Error seeding defaults:', error);
                addNotification('error', 'Error al restaurar defaults.');
            }
        }
    };

    const columns = [
        { field: 'clave', headerName: 'Clave', flex: 1, minWidth: 200 },
        { field: 'descripcion', headerName: 'Descripción', flex: 2, minWidth: 250 },
        {
            field: 'valor',
            headerName: 'Valor (Vista Previa)',
            flex: 2,
            minWidth: 200,
            valueGetter: (value) => {
                try {
                    // Try to show object summary if JSON, else raw string
                    const parsed = JSON.parse(value);
                    if (typeof parsed === 'object') return JSON.stringify(parsed).substring(0, 50) + '...';
                    return value;
                } catch (e) {
                    return value;
                }
            }
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="Editar">
                        <IconButton onClick={() => handleEdit(params.row)} size="small" color="primary">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton onClick={() => handleDelete(params.row.clave)} size="small" color="error">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        }
    ];

    return (
        <Paper sx={{ p: 2, height: 'calc(100vh - 140px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h2">
                    Gestión de Parámetros
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                    Nuevo Parámetro
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<RestoreIcon />}
                    onClick={handleRestoreDefaults}
                    sx={{ ml: 2 }}
                >
                    Agregar parámetros default
                </Button>
            </Box>

            <DataGrid
                rows={parametros}
                columns={columns}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: { showQuickFilter: true },
                }}
                disableRowSelectionOnClick
                autosizeOnMount
            />

            <ParametroForm
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedParametro}
            />
        </Paper>
    );
};

export default ParametroList;
