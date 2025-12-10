import React from 'react';
import { Container, Box, Typography, Paper, CircularProgress } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const { loginWithGoogle, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleGoogleSuccess = async (credentialResponse) => {
        if (credentialResponse.credential) {
            await loginWithGoogle(credentialResponse.credential);
        }
    };

    const handleGoogleError = () => {
        console.error('Google Login Failed');
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        Iniciar Sesión
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                        Accede al sistema con tu cuenta de Google
                    </Typography>

                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="filled_blue"
                        shape="pill"
                        size="large"
                    />
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;
