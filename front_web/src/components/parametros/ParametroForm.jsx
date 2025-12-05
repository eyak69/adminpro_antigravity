import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Alert
} from '@mui/material';
import ParametroService from '../../services/parametro.service';
import { useNotification } from '../../context/NotificationContext';

const ParametroForm = ({ open, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        clave: '',
        valor: '',
        descripcion: ''
    });
    const [jsonError, setJsonError] = useState(null);
    const { addNotification } = useNotification();
    const isEdit = !!initialData;

    useEffect(() => {
        if (initialData) {
            // Check if value is JSON object strings or plain string
            let displayValue = initialData.valor;
            // If it came from the API as an object (e.g. via ParametroService.get which parses JSON), stringify it
            // But ParametroList fetches 'rows' where 'valor' likely remains string from DB? 
            // Actually ParametroService.getAll() returns `find()` which returns entities with string `valor`.
            // So initialData.valor is likely a string.

            // However, let's try to pretty print if it is JSON
            try {
                const parsed = JSON.parse(initialData.valor);
                displayValue = JSON.stringify(parsed, null, 4);
            } catch (e) {
                // Not JSON, keep as is
            }

            setFormData({
                clave: initialData.clave,
                valor: displayValue,
                descripcion: initialData.descripcion || ''
            });
        } else {
            setFormData({ clave: '', valor: '', descripcion: '' });
        }
        setJsonError(null);
    }, [initialData, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'valor') {
            // Live validation for JSON?
            try {
                JSON.parse(value);
                setJsonError(null);
            } catch (e) {
                // Only show error if it looks like they are trying to write JSON (starts with { or [)
                if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
                    setJsonError('Invalid JSON format');
                } else {
                    setJsonError(null);
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final validation
        let finalValor = formData.valor;
        try {
            // Try parse to see if valid JSON. If so, minified or kept as structure?
            // The backend stores string.
            // If parsed successfully, we send the object to the service 'create/update' 
            // which might re-stringify it.
            // Actually verify: ParametroService.js 'update' sends { valor }. 
            // Backend Controller: 'const { valor } = req.body; ParametroService.set(valor)'.
            // Backend Service: 'typeof valor === string ? valor : JSON.stringify(valor)'.

            // So: If I send a String, it saves a String. If I send an Object, it saves Stringified Object.
            // If the user typed JSON in the text field, it's a String.
            // We should parse it to an Object BEFORE sending if we want the backend to handle it as object logic 
            // (though backend just stringifies it back).

            // Wait, best practice: Send what the user provided.
            // If they provided a valid JSON string, we can send it as a parsed object so the backend "knows" it's valid?
            // Or just send the string. 
            // If we send the string "{\"a\":1}", backend sees string, returns string.
            // When frontend reads it, `JSON.parse` works.

            // However, to ensure it is stored as "minified" JSON or consistently, maybe parsing is better.
            const parsed = JSON.parse(formData.valor);
            finalValor = parsed; // Send as object
        } catch (e) {
            // Not JSON, send as string
        }

        try {
            if (isEdit) {
                await ParametroService.update(formData.clave, finalValor, formData.descripcion);
                addNotification('success', 'Parámetro actualizado');
            } else {
                await ParametroService.create({ ...formData, valor: finalValor });
                addNotification('success', 'Parámetro creado');
            }
            onSubmit();
        } catch (error) {
            console.error('Error saving parametro:', error);
            addNotification('error', 'Error al guardar');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{isEdit ? 'Editar Parámetro' : 'Nuevo Parámetro'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Clave (ID)"
                            name="clave"
                            value={formData.clave}
                            onChange={handleChange}
                            fullWidth
                            disabled={isEdit}
                            required
                            helperText="Identificador único (ej: SYSTEM_CONFIG, TAX_RATE)"
                        />
                        <TextField
                            label="Descripción"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Valor (JSON o Texto)"
                            name="valor"
                            value={formData.valor}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={10}
                            required
                            error={!!jsonError}
                            helperText={jsonError || "Puedes ingresar texto simple o un objeto JSON."}
                            sx={{ fontFamily: 'monospace' }}
                        />
                        {jsonError && <Alert severity="warning">{jsonError}</Alert>}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={!!jsonError}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ParametroForm;
