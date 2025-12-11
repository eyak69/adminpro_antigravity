import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import aiService from '../../services/ai.service';
import Swal from 'sweetalert2';

const MagicInput = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleParse = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const result = await aiService.parse(text, today);
            navigate('/planillas/nuevo', { state: { smartData: result } });
        } catch (error) {
            console.error("AI Parse Error:", error);
            Swal.fire('Error', 'No se pudo interpretar el comando.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleParse();
        }
    };

    return (
        <TextField
            fullWidth
            placeholder="Ej: Compra 100 USD a Juan"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <AutoAwesomeIcon color="secondary" />
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={handleParse} disabled={loading || !text.trim()}>
                            {loading ? <CircularProgress size={24} /> : <SendIcon color="primary" />}
                        </IconButton>
                    </InputAdornment>
                ),
                sx: {
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: 1
                }
            }}
            sx={{ mb: 3 }}
        />
    );
};

export default MagicInput;
