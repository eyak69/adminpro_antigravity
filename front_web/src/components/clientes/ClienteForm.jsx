import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    FormControlLabel,
    Switch
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

const ClienteForm = ({ open, onClose, onSubmit, initialData }) => {
    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            alias: '',
            nombre_real: '',
            documento: '',
            notas: '',
            es_moroso: false,
        },
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        } else {
            reset({
                alias: '',
                nombre_real: '',
                documento: '',
                notas: '',
                es_moroso: false,
            });
        }
    }, [initialData, reset]);

    const handleFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Controller
                            name="alias"
                            control={control}
                            rules={{ required: 'El alias es requerido' }}
                            render={({ field, fieldState: { error } }) => (
                                <TextField
                                    {...field}
                                    label="Alias"
                                    error={!!error}
                                    helperText={error ? error.message : ''}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="nombre_real"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Nombre Real"
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="documento"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Documento"
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="notas"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Notas"
                                    multiline
                                    rows={3}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="es_moroso"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={<Switch {...field} checked={field.value} color="error" />}
                                    label="Es Moroso"
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

export default ClienteForm;
