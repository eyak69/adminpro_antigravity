import { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Button, Container, Typography, Box } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Block from '@mui/icons-material/Block'; // Block icon for 'Anular'
import { useNavigate } from 'react-router-dom';
import planillaService from '../../services/planilla.service';
import Swal from 'sweetalert2';
import { useTheme } from '@mui/material/styles';
import { useParametros } from '../../context/ParametrosContext';
import axios from 'axios';
import config from '../../config'; // Adjust path if needed

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
    const { parametros, getCellColor, getRowThemeClass } = useParametros() || {};
    const [editConfig, setEditConfig] = useState({ habilitado: true, dias: 0 });

    useEffect(() => {
        loadEditConfig();
    }, []);

    const loadEditConfig = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/parametros/EDITARPLANILLAFECHAANTERIOR`);
            if (response.data) {
                // Ensure we parse if it's string, though usually axios parses JSON.
                // The service returns the value field which might be stringified JSON or parsed object depending on backend service.
                // Our backend param service returns JSON.parse(val) or val. So it should be an object.
                const val = response.data.valor ? (typeof response.data.valor === 'string' ? JSON.parse(response.data.valor) : response.data.valor) : response.data;
                // If the endpoint wraps it, extract. The standard endpoint usually returns the Parametro entity { clave, valor }.
                // If we use the generic param service 'get' logic internally it returns value, but via API controller usually returns entity?
                // Let's assume standard entity return { clave, valor: "..." } if using generic controller, OR value if specific.
                // Wait, we don't have a param controller we viewed? 
                // Let's assume we need to parse blindly or safe check.
                // If response.data has 'valor', use it.
                let finalVal = response.data.valor || response.data;
                if (typeof finalVal === 'string') {
                    try { finalVal = JSON.parse(finalVal); } catch (e) { }
                }
                setEditConfig(finalVal || { habilitado: true, dias: 0 });
            }
        } catch (error) {
            console.error("Error fetching edit config", error);
        }
    };

    const isDateEditable = (dateStr) => {
        // dateStr is YYYY-MM-DD
        if (!editConfig.habilitado) {
            const today = getTodayString();
            return dateStr === today;
        }
        if (editConfig.dias > 0) { // 0 equals infinite
            const today = new Date(getTodayString());
            const target = new Date(dateStr);
            const diffTime = Math.abs(today - target);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // If target is in future, we usually allow (or prevent? Assuming inputs are mostly past/present).
            // If target is strictly past:
            if (target < today && diffDays > editConfig.dias) {
                return false;
            }
        }
        return true;
    };

    const canEditCurrent = isDateEditable(selectedDate);

    useEffect(() => {
        loadPlanillas();
    }, [selectedDate]);

    const loadPlanillas = async () => {
        try {
            // selectedDate is already YYYY-MM-DD
            const data = await planillaService.getAll({ fecha: selectedDate });
            // Sort by ID ascending (smallest first)
            const sortedData = data.sort((a, b) => a.id - b.id);
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
            field: 'tipo_accion',
            headerName: 'Acción',
            width: 130,
            valueGetter: (value, row) => {
                const actualRow = row || (value && value.row);
                return actualRow?.tipo_movimiento?.tipo_accion || '-';
            }
        },
        {
            field: 'contabilizacion',
            headerName: 'Contabilización',
            width: 130,
            valueGetter: (value, row) => {
                const actualRow = row || (value && value.row);
                return actualRow?.tipo_movimiento?.contabilizacion || '-';
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
                return clientObj?.alias || clientObj?.nombre_real || '-';
            }
        },
        {
            field: 'monedas',
            headerName: 'Monedas',
            width: 120,
            valueGetter: (value, row) => {
                const actualRow = row || (value && value.row);
                if (!actualRow) return '-';

                const mIn = actualRow.moneda_ingreso?.codigo;
                const mOut = actualRow.moneda_egreso?.codigo;

                if (mIn && mOut && mIn !== mOut) {
                    // For exchange: Show relation
                    return `${mIn} / ${mOut}`;
                }
                // Unilateral or same currency (transfer)
                return mIn || mOut || '-';
            }
        },
        {
            field: 'ingreso',
            headerName: 'Ingreso',
            width: 200,
            renderCell: (params) => {
                const colorKey = params.row.moneda_ingreso?.es_nacional ? 'ENTRADA' : 'COMPRA';
                return (
                    <Box>
                        {(params.row.monto_ingreso > 0 && params.row.moneda_ingreso) ? (
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: getCellColor(colorKey) }}>
                                {params.row.moneda_ingreso.codigo} {Number(params.row.monto_ingreso).toFixed(2)}
                            </Typography>
                        ) : '-'}
                    </Box>
                );
            }
        },
        {
            field: 'egreso',
            headerName: 'Egreso',
            width: 200,
            renderCell: (params) => {
                const colorKey = params.row.moneda_egreso?.es_nacional ? 'SALIDA' : 'VENTA';
                return (
                    <Box>
                        {(params.row.monto_egreso > 0 && params.row.moneda_egreso) ? (
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: getCellColor(colorKey) }}>
                                {params.row.moneda_egreso.codigo} {Number(params.row.monto_egreso).toFixed(2)}
                            </Typography>
                        ) : '-'}
                    </Box>
                );
            }
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

                        {!isAnulada && (
                            <Button
                                startIcon={<Block />}
                                color="error"
                                disabled={!canEditCurrent}
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
                        disabled={!canEditCurrent}
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
                    getRowClassName={(params) => {
                        if (params.row.deleted_at) return 'row-anulada';
                        const adaptedRow = {
                            tipo_accion: params.row.tipo_movimiento?.tipo_accion,
                            contabilizacion: params.row.tipo_movimiento?.contabilizacion
                        };
                        const themeClass = getRowThemeClass ? getRowThemeClass(adaptedRow) : '';
                        return themeClass;
                    }}
                    sx={{
                        '& .row-anulada': {
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.text.disabled,
                            fontStyle: 'italic',
                        },
                        '& .row-cruzada': {
                            backgroundColor: parametros?.themeConfig?.CRUZADO?.backgroundColor || 'rgba(0, 0, 0, 0.04)',
                            color: parametros?.themeConfig?.CRUZADO?.textColor || 'inherit'
                        }
                    }}
                />
            </Box>
        </Container>
    );
};

export default PlanillaList;
