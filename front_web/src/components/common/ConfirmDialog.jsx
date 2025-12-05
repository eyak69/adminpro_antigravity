import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberIcon color="warning" />
                {title || 'Confirmar Acción'}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    {message || '¿Estás seguro de que deseas continuar?'}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancelar
                </Button>
                <Button onClick={onConfirm} variant="contained" color="error" autoFocus>
                    Eliminar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
