import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2563eb', // Vibrant Blue
            light: '#60a5fa',
            dark: '#1e40af',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#7c3aed', // Vibrant Purple
            light: '#a78bfa',
            dark: '#5b21b6',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f3f4f6', // Light Gray background for depth
            paper: '#ffffff',
        },
        text: {
            primary: '#111827',
            secondary: '#6b7280',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
        },
        h2: {
            fontWeight: 600,
            fontSize: '2rem',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h5: {
            fontWeight: 500,
            fontSize: '1.25rem',
        },
        h6: {
            fontWeight: 500,
            fontSize: '1rem',
        },
        button: {
            textTransform: 'none', // Modern feel, no all-caps
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12, // More rounded corners
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)', // Gradient button
                    '&:hover': {
                        background: 'linear-gradient(45deg, #1d4ed8 30%, #6d28d9 90%)',
                    }
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                },
                elevation2: {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Glassmorphism effect
                    backdropFilter: 'blur(12px)',
                    color: '#111827',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#111827', // Dark sidebar
                    color: '#f3f4f6',
                    borderRight: 'none',
                },
            },
        },
    },
});

export default theme;
