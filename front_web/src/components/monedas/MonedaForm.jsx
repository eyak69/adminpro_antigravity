import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControlLabel,
    Switch,
    Box
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

const MonedaForm = ({ open, onClose, onSubmit, initialData }) => {
    const { control, handleSubmit, reset, setValue } = useForm({
        defaultValues: {
            codigo: '',
            nombre: '',
            simbolo: '',
            es_nacional: false,
            activa: true,
        },
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        } else {
            reset({
                codigo: '',
                nombre: '',
                simbolo: '',
                es_nacional: false,
                activa: true,
            });
        }
    }, [initialData, reset]);

    const handleFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? 'Editar Moneda' : 'Nueva Moneda'}</DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Controller
                            name="codigo"
                            control={control}
                            rules={{ required: 'El código es requerido', maxLength: 3 }}
                            render={({ field, fieldState: { error } }) => (
                                <TextField
                                    {...field}
                                    label="Código"
                                    error={!!error}
                                    helperText={error ? error.message : ''}
                                    inputProps={{ maxLength: 3, style: { textTransform: 'uppercase' } }}
                                    fullWidth
                                />
                            )}
                        />
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
                        <Controller
                            name="simbolo"
                            control={control}
                            rules={{ required: 'El símbolo es requerido' }}
                            render={({ field, fieldState: { error } }) => (
                                <TextField
                                    {...field}
                                    label="Símbolo"
                                    error={!!error}
                                    helperText={error ? error.message : ''}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="es_nacional"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={<Switch {...field} checked={field.value} />}
                                    label="Es Nacional"
                                />
                            )}
                        />
                        <Controller
                            name="activa"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={<Switch {...field} checked={field.value} />}
                                    label="Activa"
                                />
                            )}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">Cancelar</Button>
                    <Button type="submit" variant="contained" color="primary">
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default MonedaForm;
