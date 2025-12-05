import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    FormControlLabel,
    Switch,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Chip,
    OutlinedInput
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import OperacionService from '../../services/operacion.service';
import MonedaService from '../../services/moneda.service';

const ACCION_MOVIMIENTO = ['COMPRA', 'VENTA'];
const CONTABILIZACION = ['DEBE', 'HABER'];

const TipoMovimientoForm = ({ open, onClose, onSubmit, initialData }) => {
    const [operaciones, setOperaciones] = useState([]);
    const [monedas, setMonedas] = useState([]);

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            nombre: '',
            tipo_accion: 'COMPRA',
            contabilizacion: 'DEBE',
            requiere_persona: false,
            es_persona_obligatoria: false,
            requiere_cotizacion: false,
            lleva_observacion: false,
            graba_cta_cte: false,
            operacion_id: '',
            monedas_permitidas: []
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ops, mons] = await Promise.all([
                    OperacionService.getAll(),
                    MonedaService.getAll()
                ]);
                setOperaciones(ops);
                setMonedas(mons);
            } catch (error) {
                console.error('Error fetching dependencies:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (initialData) {
            reset({
                ...initialData,
                operacion_id: initialData.operacion ? initialData.operacion.id : '',
                monedas_permitidas: initialData.monedas_permitidas ? initialData.monedas_permitidas.map(m => m.id) : []
            });
        } else {
            reset({
                nombre: '',
                tipo_accion: 'COMPRA',
                contabilizacion: 'DEBE',
                requiere_persona: false,
                es_persona_obligatoria: false,
                requiere_cotizacion: false,
                lleva_observacion: false,
                graba_cta_cte: false,
                operacion_id: '',
                monedas_permitidas: []
            });
        }
    }, [initialData, reset]);

    const handleFormSubmit = (data) => {
        const payload = {
            ...data,
            operacionId: data.operacion_id,
            monedaIds: data.monedas_permitidas
        };
        delete payload.operacion_id;
        delete payload.monedas_permitidas;

        onSubmit(payload);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initialData ? 'Editar Tipo de Movimiento' : 'Nuevo Tipo de Movimiento'}</DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {/* Basic Info */}
                        <Box sx={{ gridColumn: 'span 2' }}>
                            <Controller
                                name="nombre"
                                control={control}
                                rules={{ required: 'El nombre es requerido' }}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        label="Nombre"
                                        error={!!error}
                                        helperText={error ? error.message : ''}
                                        fullWidth
                                    />
                                )}
                            />
                        </Box>

                        <Controller
                            name="tipo_accion"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Acción"
                                    fullWidth
                                >
                                    {ACCION_MOVIMIENTO.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        <Controller
                            name="contabilizacion"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Contabilización"
                                    fullWidth
                                >
                                    {CONTABILIZACION.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        <Controller
                            name="operacion_id"
                            control={control}
                            rules={{ required: 'La operación es requerida' }}
                            render={({ field, fieldState: { error } }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Operación"
                                    error={!!error}
                                    helperText={error ? error.message : ''}
                                    fullWidth
                                >
                                    {operaciones.map((op) => (
                                        <MenuItem key={op.id} value={op.id}>
                                            {op.nombre}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        <Controller
                            name="monedas_permitidas"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel>Monedas Permitidas</InputLabel>
                                    <Select
                                        {...field}
                                        multiple
                                        input={<OutlinedInput label="Monedas Permitidas" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => {
                                                    const moneda = monedas.find(m => m.id === value);
                                                    return <Chip key={value} label={moneda ? moneda.codigo : value} size="small" />;
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {monedas.map((moneda) => (
                                            <MenuItem key={moneda.id} value={moneda.id}>
                                                {moneda.nombre} ({moneda.codigo})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        />

                        {/* Flags */}
                        <Box sx={{ gridColumn: 'span 2', display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                            <Controller
                                name="requiere_persona"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch {...field} checked={field.value} />}
                                        label="Requiere Persona"
                                    />
                                )}
                            />
                            <Controller
                                name="es_persona_obligatoria"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch {...field} checked={field.value} />}
                                        label="Persona Obligatoria"
                                    />
                                )}
                            />
                            <Controller
                                name="requiere_cotizacion"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch {...field} checked={field.value} />}
                                        label="Requiere Cotización"
                                    />
                                )}
                            />
                            <Controller
                                name="lleva_observacion"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch {...field} checked={field.value} />}
                                        label="Lleva Observación"
                                    />
                                )}
                            />
                            <Controller
                                name="graba_cta_cte"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch {...field} checked={field.value} />}
                                        label="Graba Cta Cte"
                                    />
                                )}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">Cancelar</Button>
                    <Button type="submit" variant="contained" color="primary">
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog >
    );
};

export default TipoMovimientoForm;
