import { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Button, Container, Typography, Box, Chip } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Block from '@mui/icons-material/Block'; // Block icon for 'Anular'
import { useNavigate } from 'react-router-dom';
import planillaService from '../../services/planilla.service';
import Swal from 'sweetalert2';
import { useTheme } from '@mui/material/styles';

const PlanillaList = () => {
    const [planillas, setPlanillas] = useState([]);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        loadPlanillas();
    }, []);

    const loadPlanillas = async () => {
        try {
            const data = await planillaService.getAll();
            // Sort by ID descending to see newest first
            const sortedData = data.sort((a, b) => b.id - a.id);
            setPlanillas(sortedData);
        } catch (error) {
            console.error('Error al cargar planillas:', error);
            Swal.fire('Error', 'No se pudieron cargar las planillas', 'error');
        }
    };

    const handleAnular = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción anulará la transacción y revertirá los movimientos de stock y cuenta corriente. No se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await planillaService.remove(id);
                    Swal.fire('Anulada!', 'La transacción ha sido anulada.', 'success');
                    loadPlanillas();
                } catch (error) {
                    console.error('Error al anular:', error);
                    // Show specific error from backend if available
                    const errorMessage = error.response?.data?.error || 'No se pudo anular la planilla.';
                    Swal.fire('Error', errorMessage, 'error');
                }
            }
        });
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'fecha_operacion',
            headerName: 'Fecha',
            width: 150,
            valueFormatter: (params) => {
                if (!params.value) return '';
                return new Date(params.value).toLocaleString();
            }
        },
        {
            field: 'estado',
            headerName: 'Estado',
            width: 120,
            renderCell: (params) => {
                // Determine state based on deleted_at or similar flag if available from backend.
                // Assuming standard soft-delete behavior where deleted_at is set.
                // If the backend doesn't return deleted_at for "active" queries, we might need to adjust.
                // But usually 'softRemove' sets deleted_at. If 'getAll' filters them out, we won't see them.
                // Wait, if we use soft delete, TypeORM usually filters them out by default!
                // We might need to ask the backend to include deleted/annulled records, OR custom logic.
                // For now, looking at the Controller, it just calls `planillaService.getAll()`.
                // If TypeORM repository uses standard find, it skips soft-deleted.
                // Let's assume for this "Anular" logic, we want to SEE them?
                // If they disappear, that's also "safe" but less audible.
                // Let's implement assuming they might disappear for now, or check if 'deleted_at' is present in the object.
                const isAnulada = params.row.deleted_at != null;
                return isAnulada ? (
                    <Chip label="ANULADA" color="error" size="small" variant="outlined" />
                ) : (
                    <Chip label="ACTIVA" color="success" size="small" variant="outlined" />
                );
            }
        },
        {
            field: 'tipo_movimiento',
            headerName: 'Tipo Movimiento',
            width: 180,
            valueGetter: (value, row) => {
                // Handle cases where row might be undefined (safety check)
                if (!row) return '';
                // If the field 'tipo_movimiento' itself is the object
                if (value && value.nombre) return value.nombre;
                // Fallback to row lookup if value is just an ID or null
                return row.tipo_movimiento?.nombre || '';
            }
        },
        {
            field: 'cliente',
            headerName: 'Cliente',
            width: 180,
            valueGetter: (value, row) => {
                if (!row) return '-';
                const clientObj = value || row.cliente;
                return clientObj?.nombre || clientObj?.razon_social || '-';
            }
        },
        {
            field: 'ingreso',
            headerName: 'Ingreso',
            width: 200,
            renderCell: (params) => (
                <Box>
                    {(params.row.monto_ingreso > 0 && params.row.moneda_ingreso) ? (
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            {params.row.moneda_ingreso.codigo} {Number(params.row.monto_ingreso).toFixed(2)}
                        </Typography>
                    ) : '-'}
                </Box>
            )
        },
        {
            field: 'egreso',
            headerName: 'Egreso',
            width: 200,
            renderCell: (params) => (
                <Box>
                    {(params.row.monto_egreso > 0 && params.row.moneda_egreso) ? (
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                            {params.row.moneda_egreso.codigo} {Number(params.row.monto_egreso).toFixed(2)}
                        </Typography>
                    ) : '-'}
                </Box>
            )
        },
        { field: 'cotizacion_aplicada', headerName: 'Cotización', width: 100, type: 'number' },
        { field: 'observaciones', headerName: 'Observaciones', width: 250 },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 200,
            renderCell: (params) => {
                const isAnulada = params.row.deleted_at != null;
                return (
                    <Box>
                        <Button
                            startIcon={<Edit />}
                            onClick={() => navigate(`/planillas/editar/${params.row.id}`)}
                            size="small"
                        >
                            Ver/Editar
                        </Button>
                        {!isAnulada && (
                            <Button
                                startIcon={<Block />}
                                color="error"
                                onClick={() => handleAnular(params.row.id)}
                                size="small"
                                sx={{ ml: 1 }}
                            >
                                Anular
                            </Button>
                        )}
                    </Box>
                );
            }
        },
    ];

    return (
        <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }}>
                <Typography variant="h4" component="h1">
                    Planilla Diaria
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => navigate('/planillas/nuevo')}
                >
                    Nueva Operación
                </Button>
            </Box>
            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={planillas}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                        },
                    }}
                    getRowClassName={(params) =>
                        params.row.deleted_at ? 'row-anulada' : ''
                    }
                    sx={{
                        '& .row-anulada': {
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.text.disabled,
                            fontStyle: 'italic',
                        },
                    }}
                />
            </Box>
        </Container>
    );
};

export default PlanillaList;
