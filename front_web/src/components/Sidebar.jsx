import React from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    useMediaQuery,
    useTheme
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 280;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Monedas', icon: <AttachMoneyIcon />, path: '/monedas' },
    { text: 'Operaciones', icon: <SettingsEthernetIcon />, path: '/operaciones' },
    { text: 'Tipos Movimiento', icon: <SwapHorizIcon />, path: '/tipos-movimiento' },
    { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes' },
    { text: 'Productos', icon: <ShoppingBagIcon />, path: '/productos' },
    { text: 'Reportes', icon: <BarChartIcon />, path: '/reportes' },
    { text: 'Configuración', icon: <SettingsIcon />, path: '/configuracion' },
];

const Sidebar = ({ open, onClose }) => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const location = useLocation();
    const navigate = useNavigate();

    const content = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)'
                    }}
                >
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>A</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Antigravity
                </Typography>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <List sx={{ px: 2, py: 3 }}>
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: '12px',
                                    bgcolor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: active ? 'primary.light' : 'rgba(255,255,255,0.7)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: active ? 'primary.light' : 'rgba(255,255,255,0.7)',
                                        minWidth: 40
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: active ? 600 : 400,
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    if (isDesktop) {
        return (
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                open
            >
                {content}
            </Drawer>
        );
    }

    return (
        <Drawer
            variant="temporary"
            open={open}
            onClose={onClose}
            ModalProps={{ keepMounted: true }}
            sx={{
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
        >
            {content}
        </Drawer>
    );
};

export default Sidebar;
