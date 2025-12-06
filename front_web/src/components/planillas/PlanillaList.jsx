import { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Button, Container, Typography, Box } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Block from '@mui/icons-material/Block'; // Block icon for 'Anular'
import { useNavigate } from 'react-router-dom';
import planillaService from '../../services/planilla.service';
import Swal from 'sweetalert2';
import { useTheme } from '@mui/material/styles';

const PlanillaList = () => {
    const [planillas, setPlanillas] = useState([]);
    // Initialize with today's date formatted manually to avoid timezone issues
    const getTodayString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(getTodayString());
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        loadPlanillas();
    }, [selectedDate]);

    const loadPlanillas = async () => {
        try {
            // selectedDate is already YYYY-MM-DD
            const data = await planillaService.getAll({ fecha: selectedDate });
            // Sort by ID descending to see newest first
            const sortedData = data.sort((a, b) => b.id - a.id);
            setPlanillas(sortedData);
        } catch (error) {
            console.error('Error al cargar planillas:', error);
            Swal.fire('Error', 'No se pudieron cargar las planillas', 'error');
        }
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
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
                    const errorMessage = error.response?.data?.error || 'No se pudo anular la planilla.';
                    Swal.fire('Error', errorMessage, 'error');
                }
            }
        });
    };

    const columns = [
        {
            field: 'fecha_operacion',
            headerName: 'Fecha',
            width: 150,
            valueGetter: (value, row) => {
                const actualRow = row || (value && value.row) || {};
                const val = actualRow.fecha_operacion || actualRow.created_at || value;
                return val;
            },
            valueFormatter: (params) => {
                const dateVal = params.value || params;
                if (!dateVal) return '';

                // If it's a string, try to slice it (Handle "2023-12-05" or "2023-12-05T...")
                if (typeof dateVal === 'string') {
                    // Take the first 10 chars (YYYY-MM-DD) which are valid for both YYYY-MM-DD and ISO
                    const ymd = dateVal.slice(0, 10);
                    const [year, month, day] = ymd.split('-');
                    return `${day}/${month}/${year}`;
                }

                // If it's a Date object (fallback)
                if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
                    return dateVal.toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        timeZone: 'UTC' // Force UTC interpretation if we receive a Date object at midnight UTC
                    });
                }

                return '';
            }
        },
        {
            field: 'tipo_movimiento',
            headerName: 'Tipo Movimiento',
            width: 180,
            valueGetter: (value, row) => {
                const actualRow = row || (value && value.row);
                if (!actualRow) return '';
                if (actualRow.tipo_movimiento && actualRow.tipo_movimiento.nombre) {
                    return actualRow.tipo_movimiento.nombre;
                }
                if (value && value.nombre) return value.nombre;
                return '';
            }
        },
        {
            field: 'cliente',
            headerName: 'Cliente',
            width: 180,
            valueGetter: (value, row) => {
                const actualRow = row || (value && value.row);
                if (!actualRow) return '-';
                const clientObj = actualRow.cliente || value;
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

        {
            field: 'observaciones',
            headerName: 'Observaciones',
            width: 250,
            valueGetter: (value, row) => {
                const actualRow = row || (value && value.row);
                if (!actualRow) return '';

                if (actualRow.observaciones) return actualRow.observaciones;

                if (actualRow.cotizacion_aplicada) {
                    return `Cotización = ${actualRow.cotizacion_aplicada}`;
                }
                return '';
            }
        },
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
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '1rem'
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => navigate('/planillas/nuevo', { state: { initialDate: selectedDate } })}
                    >
                        Nueva Operación
                    </Button>
                </Box>
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
