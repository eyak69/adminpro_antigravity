import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

const OperacionForm = ({ open, onClose, onSubmit, initialData }) => {
    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            nombre: '',
        },
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        } else {
            reset({
                nombre: '',
            });
        }
    }, [initialData, reset]);

    const handleFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? 'Editar Operación' : 'Nueva Operación'}</DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

export default OperacionForm;
