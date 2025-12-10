import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import {
    Container, Typography, TextField, Button, Grid, MenuItem,
    Paper, FormControl, InputLabel, Select, FormHelperText,
    Alert, Box, CircularProgress, Card, CardContent, Autocomplete
} from '@mui/material';
import Save from '@mui/icons-material/Save';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CalculateIcon from '@mui/icons-material/Calculate';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'; // Magic Icon
import Swal from 'sweetalert2';
import planillaService from '../../services/planilla.service';
import tipoMovimientoService from '../../services/tipoMovimiento.service';
import clienteService from '../../services/cliente.service';
import monedaService from '../../services/moneda.service';
import operacionService from '../../services/operacion.service';
import aiService from '../../services/ai.service'; // Import AI Service
import parametroService from '../../services/parametro.service';
import config from '../../config';
import { NumericFormat } from 'react-number-format';

import { useAuth } from '../../context/AuthContext'; // Import Auth

const PlanillaForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Get User Context
    const location = useLocation(); // Import useLocation
    const { id } = useParams();
    const isEditMode = !!id;
    const [isLoading, setIsLoading] = useState(true);

    // Catalogs
    const [operaciones, setOperaciones] = useState([]);
    const [tiposMovimiento, setTiposMovimiento] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [monedas, setMonedas] = useState([]);

    // Derived state for cascading
    const [filteredTipos, setFilteredTipos] = useState([]);
    const [filteredMonedas, setFilteredMonedas] = useState([]);
    const [selectedTipoMov, setSelectedTipoMov] = useState(null);
    const [checkingAI, setCheckingAI] = useState(false); // Visual indicator
    const [aiEnabled, setAiEnabled] = useState(true); // Default true, but will load from DB
    const [isClassifying, setIsClassifying] = useState(false); // For Magic Button
    const [deviationConfig, setDeviationConfig] = useState({ habilitado: false, valor: 0 });
    const [lastCotizacionRef, setLastCotizacionRef] = useState(null); // To store the reference price

    const getTodayString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const initialDate = location.state?.initialDate || getTodayString();

    const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        defaultValues: {
            fecha_operacion: initialDate,
            operacionId: '',
            tipoMovimientoId: '',
            clienteId: '',
            monedaId: '',
            monto: '',
            cotizacion: '',
            observaciones: ''
        }
    });

    // Real-time calculation watchers
    const monto = useWatch({ control, name: 'monto' });
    const cotizacion = useWatch({ control, name: 'cotizacion' });
    const selectedOperacionId = useWatch({ control, name: 'operacionId' });
    const selectedTipoMovId = useWatch({ control, name: 'tipoMovimientoId' });

    // Load initial data
    useEffect(() => {
        loadCatalogs();
    }, []);

    // Load existing planilla if editing
    useEffect(() => {
        if (id && !isLoading) {
            loadPlanilla();
        }
    }, [id, isLoading]);

    // Cascading Logic 1: Operacion -> TipoMovimiento
    useEffect(() => {
        if (selectedOperacionId) {
            // Filter TiposMovimiento that belong to this Operation
            // Assuming Back-end relation: TipoMovimiento has 'operacion' field or ID.
            // If the catalog 'tiposMovimiento' has 'operacion' object/id.
            // If the backend `tipoMovimientoService.getAll()` returns the relation. 
            // We need to check if data structure supports it. 
            // If not, we might need to fetch by operation ID or assume frontend filtering.
            // Let's assume frontend filtering for now based on 'operacion' field in TipoMovimiento.
            const filtered = tiposMovimiento.filter(t => t.operacion?.id === selectedOperacionId);
            setFilteredTipos(filtered);

            // Auto-clear downstream if not editing or if current value is invalid
            if (!isEditMode) {
                setValue('tipoMovimientoId', '');
                setFilteredMonedas([]);
            }
        } else {
            setFilteredTipos([]);
        }
    }, [selectedOperacionId, tiposMovimiento, isEditMode, setValue]);

    // Cascading Logic 2: TipoMovimiento -> Moneda & Smart Defaults
    useEffect(() => {
        if (selectedTipoMovId) {
            const tipo = tiposMovimiento.find(t => t.id === selectedTipoMovId);
            setSelectedTipoMov(tipo);

            if (tipo) {
                // Filter Monedas: Use 'monedas_permitidas' if available, else all or specific logic.
                // Assuming 'monedas_permitidas' is an array in the object.
                let availableMonedas = monedas;
                if (tipo.monedas_permitidas && tipo.monedas_permitidas.length > 0) {
                    availableMonedas = tipo.monedas_permitidas;
                }
                setFilteredMonedas(availableMonedas);

                // Smart Default: If only 1 currency, select it
                if (!isEditMode && availableMonedas.length === 1) {
                    setValue('monedaId', availableMonedas[0].id);
                }

                // Smart UX: Reset fields based on config if NOT editing
                // SKIP clearing if we have smartData pre-fill pending
                if (!isEditMode && !location.state?.smartData) {
                    if (!tipo.requiere_persona) {
                        setValue('clienteId', '');
                    }
                    if (!tipo.requiere_cotizacion) {
                        setValue('cotizacion', '');
                    } else {
                        // Smart Default: Fetch Last Quotation for this currency
                        if (availableMonedas.length === 1 || watch('monedaId')) {
                            // ...
                        }
                    }
                    // Reset Observaciones if not required
                    if (!tipo.lleva_observacion) {
                        setValue('observaciones', '');
                    }
                }
            }
        } else {
            setSelectedTipoMov(null);
            setFilteredMonedas([]);
        }
    }, [selectedTipoMovId, tiposMovimiento, monedas, isEditMode, setValue]);

    // NEW: Smart Quotation Fetcher
    const selectedMonedaId = useWatch({ control, name: 'monedaId' });

    useEffect(() => {
        const fetchCotizacion = async () => {
            // Avoid overwriting Smart Data quotation if it matches the current context
            const sd = location.state?.smartData;
            if (sd?.cotizacion && sd?.monedaId === selectedMonedaId) {
                return;
            }

            if (selectedMonedaId && selectedTipoMov?.requiere_cotizacion && !isEditMode) {
                try {
                    // Send the action (COMPRA/VENTA) if available to refine prediction
                    const action = selectedTipoMov.tipo_accion;
                    const lastCot = await planillaService.getLastCotizacion(selectedMonedaId, action);
                    // Only set if we got a value (even 0 is a value, but usually we want > 0 to be useful)
                    // Requirements say: "last val or 0".
                    // If 0, maybe leave empty or set 0? User said "poner 0".
                    // Requirements say: "last val or 0".
                    // If 0, maybe leave empty or set 0? User said "poner 0".
                    setLastCotizacionRef(lastCot); // Store for deviation check
                    setValue('cotizacion', lastCot);
                } catch (err) {
                    console.error("Error fetching last cotizacion", err);
                }
            }
        };
        fetchCotizacion();
    }, [selectedMonedaId, selectedTipoMov, isEditMode, setValue, location.state]);

    // NEW: Ref to track last checked state to prevent duplicate calls
    // REMOVED REF as logic is changed





    const loadCatalogs = async () => {
        try {

            const responses = await Promise.all([
                operacionService.getAll(),
                tipoMovimientoService.getAll(),
                clienteService.getAll(),
                monedaService.getAll(),
                parametroService.get('CONTROLPORIA').catch(err => true),
                parametroService.get('TASADESVICION').catch(err => ({ habilitado: true, valor: 1.5 }))
            ]);
            const [opsData, tiposData, clientesData, monedasData, controlPoria, tasaDesviacion] = responses;

            setOperaciones(opsData);
            setTiposMovimiento(tiposData);

            if (tasaDesviacion) {
                // Handle if stringified or object
                let config = tasaDesviacion;
                if (typeof tasaDesviacion === 'string') {
                    try { config = JSON.parse(tasaDesviacion); } catch (e) { }
                }
                setDeviationConfig(config);
            }

            // Set AI Status (if parameter exists, use it; otherwise default true)
            if (controlPoria !== null && controlPoria !== undefined) {
                if (typeof controlPoria === 'string') {
                    setAiEnabled(controlPoria === 'true');
                } else {
                    setAiEnabled(!!controlPoria);
                }
            }

            // Filter only VIP Clients for selection -> REMOVED by user request
            // const vipClientes = clientesData.filter(c => c.es_vip);
            setClientes(clientesData);

            setMonedas(monedasData);
            setIsLoading(false);
        } catch (error) {
            console.error('Error loading catalogs:', error);
            Swal.fire('Error', 'Error cargando catálogos.', 'error');
            setIsLoading(false);
        }
    };

    // Apply Smart Data after catalogs are loaded
    useEffect(() => {
        if (!isLoading && location.state?.smartData) {
            const sd = location.state.smartData;

            // Set values if provided by AI
            if (sd.tipoMovimientoId) {
                // Critical: We must reverse-engineer the OperacionId for the form to calculate the cascade
                const tipo = tiposMovimiento.find(t => t.id === sd.tipoMovimientoId);
                if (tipo && tipo.operacion) {
                    setValue('operacionId', tipo.operacion.id || tipo.operacion);
                }
                setValue('tipoMovimientoId', sd.tipoMovimientoId);
            }

            // Wait for cascading? useForm setValue is usually sync, but effects run a bit later.
            // Since we blocked the clearing logic in the cascade effect above, we can set these safely.

            if (sd.clienteId) setValue('clienteId', sd.clienteId);
            if (sd.monedaId) setValue('monedaId', sd.monedaId);
            if (sd.monto) setValue('monto', sd.monto);
            if (sd.cotizacion) setValue('cotizacion', sd.cotizacion);
            if (sd.observaciones) setValue('observaciones', sd.observaciones);
            if (sd.fecha) setValue('fecha_operacion', sd.fecha);
        }
    }, [isLoading, location.state, setValue, tiposMovimiento]);

    const loadPlanilla = async () => {
        try {
            const data = await planillaService.getById(id);

            // SPECIAL HANDLE: If editing a record with a non-VIP client (legacy), 
            // ensure they appear in the options so the form doesn't look broken.
            if (data.cliente) {
                setClientes(prev => {
                    const exists = prev.some(c => c.id === data.cliente.id);
                    if (!exists) {
                        return [...prev, data.cliente];
                    }
                    return prev;
                });
            }

            // We need to reverse-engineer cascading selections
            // 1. Set Operacion (from TipoMovimiento's operation)
            const opId = data.tipo_movimiento?.operacion?.id || '';

            reset({
                fecha_operacion: new Date(data.fecha_operacion).toISOString().slice(0, 16),
                operacionId: opId,
                tipoMovimientoId: data.tipo_movimiento?.id || '',
                clienteId: data.cliente?.id || '',
                monedaId: (data.moneda_ingreso || data.moneda_egreso)?.id || '',
                monto: (data.monto_ingreso > 0 ? data.monto_ingreso : data.monto_egreso) || '',
                cotizacion: data.cotizacion_aplicada || '',
                observaciones: data.observaciones || ''
            });

            // Allow cascading effects to run
        } catch (error) {
            console.error('Error loading planilla:', error);
            Swal.fire('Error', 'No se pudo cargar la planilla.', 'error');
            navigate('/planillas');
        }
    };

    const onSubmit = async (data) => {
        // Validation: Deviation Rate
        // Logic: Checks enabled, reference exists, creating new (or strict edit), and user is NOT a Manager/Admin.
        const isManager = ['admin', 'gerente'].includes(user?.role?.toLowerCase());

        if (!isManager && deviationConfig.habilitado && lastCotizacionRef && !isEditMode && data.cotizacion) {
            const currentCot = Number(data.cotizacion);
            const refCot = Number(lastCotizacionRef);

            if (currentCot > 0 && refCot > 0) {
                const diff = Math.abs(currentCot - refCot);
                const percentageDiff = (diff / refCot) * 100;

                if (percentageDiff > deviationConfig.valor) {
                    await Swal.fire({
                        title: 'Diferencia de Precio Excesiva',
                        text: `La cotización ingresada varía un ${percentageDiff.toFixed(2)}% respecto a la referencia (${refCot}). El límite permitido es ${deviationConfig.valor}%. Solicite autorización a un Gerente.`,
                        icon: 'error',
                        confirmButtonText: 'Corregir Precio',
                        confirmButtonColor: '#d33',
                        allowOutsideClick: false
                    });
                    return; // STRICT BLOCK
                }
            }
        }

        try {
            if (isEditMode) {
                await planillaService.update(id, {
                    observaciones: data.observaciones,
                    cliente: data.clienteId ? { id: data.clienteId } : null,
                    fecha_operacion: data.fecha_operacion
                });
                await Swal.fire({
                    icon: 'success',
                    title: 'Actualizado',
                    text: 'Registro actualizado correctamente.',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                const payload = {
                    ...data,
                    tipoMovimientoId: Number(data.tipoMovimientoId),
                    clienteId: data.clienteId ? Number(data.clienteId) : undefined,
                    monedaId: Number(data.monedaId),
                    monto: Number(data.monto),
                    cotizacion: data.cotizacion ? Number(data.cotizacion) : undefined
                };
                await planillaService.create(payload);
                await Swal.fire({
                    icon: 'success',
                    title: 'Creado',
                    text: 'Transacción registrada exitosamente.',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            navigate('/planillas', { state: { selectedDate: data.fecha_operacion } });
        } catch (error) {
            console.error('Error saving:', error);
            // Optimistic Stock Error Handling
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error desconocido';

            if (errorMsg.includes('Saldo insuficiente') || error.response?.status === 400) {
                const title = errorMsg.includes('Saldo insuficiente') ? 'Saldo Insuficiente' : 'Atención';
                Swal.fire({
                    title: title,
                    text: errorMsg,
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            } else {
                Swal.fire('Error', errorMsg, 'error');
            }
        }
    };

    const handleAutoClassify = async () => {
        const text = watch('observaciones');
        if (!text) return;

        setIsClassifying(true);
        try {
            const result = await aiService.classify(text);

            if (result.operacionId) setValue('operacionId', result.operacionId);
            // Wait a tick for cascade? Or set directly?
            // If we set operacionId, the effect clears downstream. We might need to wait or handle it carefully.
            // The effect runs on 'selectedOperacionId' change. 
            // If we set both rapidly, pure React state might batch them, but the effect dependency on selectedOperacionId might clear tipoMovimientoId.
            // Safe approach: Set Operacion, wait, set Tipo.
            // OR: The classification provides both so we know they are valid.
            // Let's set them. The effect clears if 'selectedOperacionId' changes. 
            // If we set `operacionId` state (via setValue), the effect triggers. 
            // The effect says: `if (!isEditMode) setValue('tipoMovimientoId', '')`.
            // So if we set `tipoMovimientoId` here, the effect will wipe it out immediately after.
            // WORKAROUND: We need to bypass that wipe, or wait for it.
            // Hacky but simple: Set operacion, wait 100ms, set type.

            if (result.operacionId) {
                setValue('operacionId', result.operacionId);
                setTimeout(() => {
                    if (result.tipoMovimientoId) setValue('tipoMovimientoId', result.tipoMovimientoId);
                }, 200);
            }

            if (result.suggestedObservation) {
                setValue('observaciones', result.suggestedObservation);
            }
        } catch (error) {
            console.error("Auto Classify Failed", error);
        } finally {
            setIsClassifying(false);
        }
    };

    const totalConversion = (Number(monto || 0) * Number(cotizacion || 0)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 6 });

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Button startIcon={<ArrowBack />} onClick={() => navigate('/planillas', { state: { selectedDate: watch('fecha_operacion') } })} sx={{ mr: 2 }}>
                        Volver
                    </Button>
                    <Typography variant="h5" component="h1">
                        {isEditMode ? 'Ver / Editar Planilla' : 'Nueva Operación'}
                    </Typography>
                </Box>

                {isEditMode && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <strong>Modo Edición Restringido:</strong> Para modificar montos, monedas o tipo de movimiento, debe <strong>Anular</strong> y crear de nuevo.
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3} direction="column">

                        {/* 1. FECHA */}
                        <Grid size={12}>
                            <Controller
                                name="fecha_operacion"
                                control={control}
                                rules={{ required: 'Fecha requerida' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Fecha Operación"
                                        type="date"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!errors.fecha_operacion}
                                        helperText={errors.fecha_operacion?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* 2. OPERACION (FILTRO) */}
                        <Grid size={12}>
                            <FormControl fullWidth error={!!errors.operacionId}>
                                <InputLabel>Operación</InputLabel>
                                <Controller
                                    name="operacionId"
                                    control={control}
                                    rules={{ required: !isEditMode ? 'Requerido' : false }}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="Operación"
                                            disabled={isEditMode}
                                        >
                                            {operaciones.map(op => (
                                                <MenuItem key={op.id} value={op.id}>{op.nombre}</MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.operacionId && <FormHelperText>{errors.operacionId.message}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        {/* 3. TIPO MOVIMIENTO (CASCADA) */}
                        <Grid size={12}>
                            <FormControl fullWidth error={!!errors.tipoMovimientoId}>
                                <InputLabel>Movimiento</InputLabel>
                                <Controller
                                    name="tipoMovimientoId"
                                    control={control}
                                    rules={{ required: !isEditMode ? 'Requerido' : false }}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="Movimiento"
                                            disabled={isEditMode || !selectedOperacionId}
                                        >
                                            {filteredTipos.length > 0 ? (
                                                filteredTipos.map(tipo => (
                                                    <MenuItem key={tipo.id} value={tipo.id}>{tipo.nombre}</MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem value="" disabled>Seleccione Operación primero</MenuItem>
                                            )}
                                        </Select>
                                    )}
                                />
                                {errors.tipoMovimientoId && <FormHelperText>{errors.tipoMovimientoId.message}</FormHelperText>}
                            </FormControl>
                        </Grid>


                        {/* 4. MONEDA (CASCADA) */}
                        <Grid size={12}>
                            <FormControl fullWidth error={!!errors.monedaId}>
                                <InputLabel>Moneda</InputLabel>
                                <Controller
                                    name="monedaId"
                                    control={control}
                                    rules={{ required: !isEditMode ? 'Requerido' : false }}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="Moneda"
                                            disabled={isEditMode}
                                        >
                                            {filteredMonedas.map(moneda => (
                                                <MenuItem key={moneda.id} value={moneda.id}>
                                                    {moneda.nombre} ({moneda.codigo})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                {errors.monedaId && <FormHelperText>{errors.monedaId.message}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        {/* LINEA 2: VALORES */}

                        <Grid size={12}>
                            <Controller
                                name="monto"
                                control={control}
                                rules={{ required: !isEditMode ? 'Requerido' : false, min: 0.01 }}
                                render={({ field: { onChange, name, value, ref } }) => (
                                    <NumericFormat
                                        customInput={TextField}
                                        label="Monto"
                                        value={value}
                                        onValueChange={(values) => {
                                            onChange(values.value);
                                        }}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={6}
                                        fixedDecimalScale={true}
                                        fullWidth
                                        disabled={isEditMode}
                                        error={!!errors.monto}
                                        helperText={errors.monto?.message}
                                        getInputRef={ref}
                                    />
                                )}
                            />
                        </Grid>

                        {/* COTIZACION (CONDICIONAL) */}
                        {(!selectedTipoMov || selectedTipoMov.requiere_cotizacion || isEditMode) && (
                            <Grid size={12}>
                                <Controller
                                    name="cotizacion"
                                    control={control}
                                    // Required only if type requires it
                                    rules={{
                                        required: (selectedTipoMov?.requiere_cotizacion && !isEditMode) ? 'Cotización requerida' : false,
                                        min: { value: 0.0001, message: 'Cotización debe ser mayor a 0' }
                                    }}
                                    render={({ field: { onChange, name, value, ref } }) => (
                                        <>
                                            <NumericFormat
                                                customInput={TextField}
                                                label="Cotización"
                                                value={value}
                                                onValueChange={(values) => {
                                                    onChange(values.value);
                                                }}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                decimalScale={6}
                                                fixedDecimalScale={true}
                                                fullWidth
                                                disabled={isEditMode || (selectedTipoMov && !selectedTipoMov.requiere_cotizacion)}
                                                error={!!errors.cotizacion}
                                                helperText={errors.cotizacion?.message}
                                                getInputRef={ref}
                                                sx={{
                                                    display: (selectedTipoMov && !selectedTipoMov.requiere_cotizacion && !value) ? 'none' : 'block'
                                                }}
                                                InputProps={{
                                                    endAdornment: checkingAI && <CircularProgress size={20} color="warning" />
                                                }}
                                            />
                                            {checkingAI && <FormHelperText sx={{ color: 'warning.main' }}>IA analizando cotización...</FormHelperText>}
                                        </>
                                    )}
                                />
                            </Grid>
                        )}

                        {/* UX: CALCULADORA EN TIEMPO REAL (Solo si requiere cotización) */}
                        {selectedTipoMov?.requiere_cotizacion && (
                            <Grid size={12}>
                                <Card variant="outlined" sx={{ bgcolor: 'action.hover', width: '100%' }}>
                                    <CardContent sx={{ p: '16px !important' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Total Conversión (Editar para calcular cotización)
                                            </Typography>
                                            <NumericFormat
                                                customInput={TextField}
                                                variant="standard"
                                                placeholder="Ingrese total para calcular cotización..."
                                                value={monto && cotizacion ? (monto * cotizacion) : ''}
                                                onValueChange={(values) => {
                                                    const newTotal = values.floatValue;
                                                    const currentMonto = Number(watch('monto'));

                                                    // Only calculate if we have a valid Monto and the user is explicitly changing the Total
                                                    // We use a small threshold check or focus check implicitly by user interaction
                                                    if (currentMonto > 0 && newTotal !== undefined) {
                                                        const calculatedCoti = newTotal / currentMonto;
                                                        // Update cotizacion with 4 decimals logic
                                                        setValue('cotizacion', calculatedCoti, { shouldDirty: true });
                                                    }
                                                }}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                decimalScale={6}
                                                fixedDecimalScale={true}
                                                InputProps={{
                                                    startAdornment: <Typography variant="h6" color="primary.main" sx={{ mr: 1 }}>$</Typography>,
                                                    disableUnderline: true,
                                                    sx: { fontSize: '1.25rem', fontWeight: 'bold', color: 'primary.main' }
                                                }}
                                                fullWidth
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        {/* CLIENTE (CONDICIONAL - Show/Hide based on requiere_persona) */}
                        {(selectedTipoMov?.requiere_persona || isEditMode) && (
                            <Grid size={12}>
                                <FormControl fullWidth error={!!errors.clienteId}>
                                    {/* Removed InputLabel here because Autocomplete handles it inside TextField */}
                                    <Controller
                                        name="clienteId"
                                        control={control}
                                        rules={{
                                            required: (selectedTipoMov?.requiere_persona && !isEditMode) ? 'El cliente es obligatorio para esta operación' : false
                                        }}
                                        render={({ field }) => (
                                            <Autocomplete
                                                {...field}
                                                options={clientes}
                                                getOptionLabel={(option) => {
                                                    // Handle both object and potentially just ID if initial load hasn't mapped it yet
                                                    if (!option) return '';
                                                    return `${option.alias} ${option.nombre_real ? `(${option.nombre_real})` : ''}`;
                                                }}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                value={clientes.find(c => c.id === field.value) || null}
                                                onChange={(_, newValue) => {
                                                    field.onChange(newValue ? newValue.id : '');
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Buscar Cliente / Persona"
                                                        error={!!errors.clienteId}
                                                        helperText={errors.clienteId?.message}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <>
                                                                    {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                                    {params.InputProps.endAdornment}
                                                                </>
                                                            ),
                                                        }}
                                                    />
                                                )}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Grid>
                        )}

                        {/* OBSERVACIONES (CONDICIONAL - Show/Hide based on lleva_observacion) */}
                        {(selectedTipoMov?.lleva_observacion || isEditMode) && (
                            <Grid size={12}>
                                <Controller
                                    name="observaciones"
                                    control={control}
                                    rules={{
                                        required: (selectedTipoMov?.lleva_observacion && !isEditMode) ? 'Observación obligatoria' : false
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Observaciones"
                                            multiline
                                            rows={2}
                                            fullWidth
                                            error={!!errors.observaciones}
                                            helperText={errors.observaciones?.message}
                                            InputProps={{
                                                endAdornment: (aiEnabled && !isEditMode) && (
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', pb: 1 }}>
                                                        <Button
                                                            size="small"
                                                            startIcon={isClassifying ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                                                            onClick={handleAutoClassify}
                                                            disabled={isClassifying || !watch('observaciones')}
                                                            title="Autocompletar con IA"
                                                            sx={{ minWidth: 'auto', px: 1 }}
                                                        >
                                                            {/* Magic! */}
                                                        </Button>
                                                    </Box>
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                        <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined" onClick={() => navigate('/planillas', { state: { selectedDate: watch('fecha_operacion') } })}>
                                Cancelar
                            </Button>
                            <Button variant="contained" type="submit" startIcon={<Save />} size="large">
                                {isEditMode ? 'Guardar Cambios' : 'Confirmar Operación'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default PlanillaForm;
