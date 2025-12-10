import { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Grid, Paper,
    TextField, Select, MenuItem,
    FormControl, InputLabel, CircularProgress,
    Card, CardContent, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import clienteService from '../../services/cliente.service';
import monedaService from '../../services/moneda.service';
import ctaCteService from '../../services/ctaCte.service';
import { useParametros } from '../../context/ParametrosContext';
import Swal from 'sweetalert2';

const CtaCtePorCliente = () => {
    const [clientes, setClientes] = useState([]);
    const [monedas, setMonedas] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [selectedMonedaId, setSelectedMonedaId] = useState('');

    const [movimientos, setMovimientos] = useState([]);
    const [saldoActual, setSaldoActual] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const { getCellColor, getRowThemeClass, parametros } = useParametros();

    // ... (rest of code) ...




    // Modal Search State
    const [openSearch, setOpenSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCatalogs();
    }, []);

    const loadCatalogs = async () => {
        try {
            const [clientesData, monedasData] = await Promise.all([
                clienteService.getAll(),
                monedaService.getAll()
            ]);
            setClientes(clientesData);
            setMonedas(monedasData);
        } catch (error) {
            console.error("Error loading catalogs", error);
            Swal.fire('Error', 'No se pudieron cargar los catálogos', 'error');
        }
    };

    useEffect(() => {
        if (selectedCliente && selectedMonedaId) {
            loadCtaCte();
        } else {
            setMovimientos([]);
            setSaldoActual(0);
        }
    }, [selectedCliente, selectedMonedaId]);

    const loadCtaCte = async () => {
        setIsLoading(true);
        try {
            // 1. Get all movements for client
            const allMovs = await ctaCteService.getMovimientos(selectedCliente.id);

            // 2. Filter by selected currency
            const filteredMovs = allMovs.filter(m => m.moneda?.id === Number(selectedMonedaId));

            // 3. Calculate Running Balance (Evolution)
            // User requested ID ASC sort.
            const sortedAsc = [...filteredMovs].sort((a, b) => a.id - b.id);

            let saldo = 0;
            const movsWithSaldo = sortedAsc.map(m => {
                const ingreso = Number(m.monto_ingreso || 0); // Debe (Deuda inc)
                const egreso = Number(m.monto_egreso || 0);   // Haber (Pago inc)

                // Logic: 
                // Ingreso (Entra a la deuda del cliente) -> Suma
                // Egreso (Cliente paga) -> Resta
                saldo = saldo + ingreso - egreso;

                return {
                    ...m,
                    saldo_acumulado: saldo
                };
            });

            // 4. Update state (Show ASC as requested)
            setMovimientos(movsWithSaldo);

            setSaldoActual(saldo);
            setIsLoading(false);

        } catch (error) {
            console.error("Error loading Ctas Ctes", error);
            setMovimientos([]);
            setIsLoading(false);
        }
    };

    const handleSelectClient = (cliente) => {
        setSelectedCliente(cliente);
        setOpenSearch(false);
        setSearchTerm('');
    };

    // Filter clients for modal
    const filteredClientes = clientes.filter(c =>
        c.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.nombre_real && c.nombre_real.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const clientColumns = [
        { field: 'alias', headerName: 'Alias', flex: 1 },
        { field: 'nombre_real', headerName: 'Nombre Real', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
    ];

    // Determine headers based on currency type
    const currentMoneda = monedas.find(m => m.id === selectedMonedaId);
    const isForeign = currentMoneda && !currentMoneda.es_nacional;

    // Logic: 
    // Ingreso (Debe/Red) -> Increases Debt -> Client Buys (Compra)
    // Egreso (Haber/Green) -> Decreases Debt -> Client Sells (Venta)
    const headerIngreso = isForeign ? 'Compra' : 'Debe (Entra)';
    const headerEgreso = isForeign ? 'Venta' : 'Haber (Sale)';

    // Determine keys for dynamic colors logic
    // Compra = Ingreso = Red? No, check params.
    // If Foreign -> 'COMPRA'. If National -> 'DEBE'.
    const colorKeyIngreso = isForeign ? 'COMPRA' : 'ENTRADA';
    const colorKeyEgreso = isForeign ? 'VENTA' : 'SALIDA';

    const columns = [
        {
            field: 'fecha_operacion',
            headerName: 'Fecha',
            width: 120,
            valueFormatter: (value) => {
                if (!value) return '';
                // Handle both ISO string and Date object
                return new Date(value).toLocaleDateString('es-AR', { timeZone: 'UTC' });
            }
        },
        {
            field: 'observaciones',
            headerName: 'Concepto',
            width: 300,
            valueGetter: (value, row) => {
                return row.observaciones || '-';
            }
        },
        {
            field: 'monto_ingreso',
            headerName: headerIngreso,
            width: 150,
            renderCell: (params) => (
                <Typography sx={{ color: getCellColor(colorKeyIngreso), fontWeight: params.value > 0 ? 'bold' : 'normal' }}>
                    $ {saldoActual.toFixed(6)}
                </Typography>
            )
        },
        {
            field: 'monto_egreso',
            headerName: headerEgreso,
            width: 150,
            renderCell: (params) => (
                <Typography sx={{ color: getCellColor(colorKeyEgreso), fontWeight: params.value > 0 ? 'bold' : 'normal' }}>
                    $ {saldoActual.toFixed(6)}
                </Typography>
            )
        },
        {
            field: 'saldo_acumulado',
            headerName: 'Saldo',
            width: 180,
            renderCell: (params) => (
                <Typography fontWeight="bold">
                    {params.value > 0 ? `$ ${Number(params.value).toFixed(6)}` : '-'}
                </Typography>
            )
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
                Cuenta Corriente por Cliente
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    {/* Row 1: Client Search (Modal Trigger) */}
                    <Grid item xs={12}>
                        <Box display="flex" gap={1} alignItems="center">
                            <TextField
                                label="Cliente Seleccionado"
                                value={selectedCliente ? `${selectedCliente.alias} (${selectedCliente.nombre_real || ''})` : 'Ninguno'}
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    readOnly: true,
                                    style: { fontSize: '1.2rem', fontWeight: 'bold' }
                                }}
                            />
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => setOpenSearch(true)}
                                startIcon={<SearchIcon />}
                                sx={{ py: 1.8, px: 4 }}
                            >
                                Buscar
                            </Button>
                        </Box>
                    </Grid>

                    {/* Row 2: Currency and Info */}
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Moneda</InputLabel>
                            <Select
                                value={selectedMonedaId}
                                label="Moneda"
                                onChange={(e) => setSelectedMonedaId(e.target.value)}
                            >
                                {monedas.map((m) => (
                                    <MenuItem key={m.id} value={m.id}>
                                        {m.nombre} ({m.codigo})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        {/* Info Box */}
                        {selectedCliente && selectedMonedaId && (
                            <Card variant="outlined">
                                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 }, textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">Saldo Actual</Typography>
                                    <Typography variant="h4" color={saldoActual > 0 ? "error.main" : "success.main"} fontWeight="bold">
                                        $ {saldoActual.toFixed(6)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={movimientos}
                    columns={columns}
                    pageSize={50}
                    loading={isLoading}
                    getRowId={(row) => row.id}
                    slots={{ toolbar: GridToolbar }}
                    disableSelectionOnClick
                    density="compact"
                    getRowClassName={(params) => {
                        const row = params.row;
                        // Adapt data structure for helper (CtaCte has nested relations)
                        const adaptedRow = {
                            tipo_accion: row.planilla_asociada?.tipo_movimiento?.tipo_accion,
                            contabilizacion: row.planilla_asociada?.tipo_movimiento?.contabilizacion
                        };
                        return getRowThemeClass(adaptedRow);
                    }}
                    sx={{
                        '& .row-cruzada': {
                            backgroundColor: parametros?.themeConfig?.CRUZADO?.backgroundColor || 'rgba(0, 0, 0, 0.04)',
                            color: parametros?.themeConfig?.CRUZADO?.textColor || 'inherit'
                        }
                    }}
                />
            </Paper>

            {/* Client Search Modal */}
            <Dialog open={openSearch} onClose={() => setOpenSearch(false)} maxWidth="md" fullWidth>
                <DialogTitle>Buscar Cliente</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1, mb: 2 }}>
                        <TextField
                            autoFocus
                            label="Buscar por Alias o Nombre"
                            fullWidth
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Empiece a escribir..."
                        />
                    </Box>
                    <div style={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={filteredClientes}
                            columns={clientColumns}
                            pageSize={5}
                            getRowId={(row) => row.id}
                            onRowClick={(params) => handleSelectClient(params.row)}
                            density="compact"
                            disableSelectionOnClick={false} // Allow clicking
                            sx={{ cursor: 'pointer' }}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSearch(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default CtaCtePorCliente;
