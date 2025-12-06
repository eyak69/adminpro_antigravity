import { useState, useEffect } from 'react';
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
import Swal from 'sweetalert2';
import planillaService from '../../services/planilla.service';
import tipoMovimientoService from '../../services/tipoMovimiento.service';
import clienteService from '../../services/cliente.service';
import monedaService from '../../services/moneda.service';
import operacionService from '../../services/operacion.service';

const PlanillaForm = () => {
    const navigate = useNavigate();
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
                if (!isEditMode) {
                    if (!tipo.requiere_persona) {
                        setValue('clienteId', '');
                    }
                    if (!tipo.requiere_cotizacion) {
                        setValue('cotizacion', '');
                    } else {
                        // Smart Default: Suggest 1000 if empty
                        if (!watch('cotizacion')) setValue('cotizacion', 1000);
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


    const loadCatalogs = async () => {
        try {
            const [opsData, tiposData, clientesData, monedasData] = await Promise.all([
                operacionService.getAll(),
                tipoMovimientoService.getAll(),
                clienteService.getAll(),
                monedaService.getAll()
            ]);
            setOperaciones(opsData);
            setTiposMovimiento(tiposData);
            setClientes(clientesData);
            setMonedas(monedasData);
            setIsLoading(false);
        } catch (error) {
            console.error('Error loading catalogs:', error);
            Swal.fire('Error', 'Error cargando catálogos.', 'error');
            setIsLoading(false);
        }
    };

    const loadPlanilla = async () => {
        try {
            const data = await planillaService.getById(id);
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
        try {
            if (isEditMode) {
                await planillaService.update(id, {
                    observaciones: data.observaciones,
                    cliente: data.clienteId ? { id: data.clienteId } : null,
                    fecha_operacion: data.fecha_operacion
                });
                Swal.fire('Actualizado', 'Registro actualizado correctamente.', 'success');
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
                Swal.fire('Creado', 'Transacción registrada exitosamente.', 'success');
            }
            navigate('/planillas');
        } catch (error) {
            console.error('Error saving:', error);
            // Optimistic Stock Error Handling
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error desconocido';

            if (errorMsg.includes('Saldo insuficiente') || error.response?.status === 400) {
                Swal.fire({
                    title: 'Saldo Insuficiente',
                    text: `No se pudo completar la operación: ${errorMsg}`,
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            } else {
                Swal.fire('Error', errorMsg, 'error');
            }
        }
    };

    const totalConversion = (Number(monto || 0) * Number(cotizacion || 0)).toFixed(2);

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Button startIcon={<ArrowBack />} onClick={() => navigate('/planillas')} sx={{ mr: 2 }}>
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
                        <Grid xs={12}>
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
                        <Grid xs={12}>
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
                        <Grid xs={12}>
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
                        <Grid xs={12}>
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

                        <Grid xs={12}>
                            <Controller
                                name="monto"
                                control={control}
                                rules={{ required: !isEditMode ? 'Requerido' : false, min: 0.01 }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Monto"
                                        type="number"
                                        fullWidth
                                        disabled={isEditMode}
                                        error={!!errors.monto}
                                        helperText={errors.monto?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {/* COTIZACION (CONDICIONAL) */}
                        {(!selectedTipoMov || selectedTipoMov.requiere_cotizacion || isEditMode) && (
                            <Grid xs={12}>
                                <Controller
                                    name="cotizacion"
                                    control={control}
                                    // Required only if type requires it
                                    rules={{
                                        required: (selectedTipoMov?.requiere_cotizacion && !isEditMode) ? 'Cotización requerida' : false,
                                        min: { value: 0.0001, message: 'Cotización debe ser mayor a 0' }
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Cotización"
                                            type="number"
                                            fullWidth
                                            disabled={isEditMode || (selectedTipoMov && !selectedTipoMov.requiere_cotizacion)}
                                            error={!!errors.cotizacion}
                                            helperText={errors.cotizacion?.message}
                                            sx={{
                                                display: (selectedTipoMov && !selectedTipoMov.requiere_cotizacion && !field.value) ? 'none' : 'block'
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                        {/* UX: CALCULADORA EN TIEMPO REAL (Solo si requiere cotización) */}
                        {selectedTipoMov?.requiere_cotizacion && (
                            <Grid xs={12}>
                                <Card variant="outlined" sx={{ bgcolor: 'action.hover', width: '100%' }}>
                                    <CardContent sx={{ p: '10px !important', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Total Conversión</Typography>
                                            <Typography variant="h6" color="primary.main" fontWeight="bold">
                                                $ {totalConversion}
                                            </Typography>
                                        </Box>
                                        <CalculateIcon color="disabled" />
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        {/* CLIENTE (CONDICIONAL - Show/Hide based on requiere_persona) */}
                        {(selectedTipoMov?.requiere_persona || isEditMode) && (
                            <Grid xs={12}>
                                <FormControl fullWidth error={!!errors.clienteId}>
                                    {/* Removed InputLabel here because Autocomplete handles it inside TextField */}
                                    <Controller
                                        name="clienteId"
                                        control={control}
                                        rules={{
                                            required: (selectedTipoMov?.es_persona_obligatoria && !isEditMode) ? 'El cliente es obligatorio para esta operación' : false
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
                            <Grid xs={12}>
                                <Controller
                                    name="observaciones"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Observaciones"
                                            multiline
                                            rows={2}
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                        <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined" onClick={() => navigate('/planillas')}>
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
