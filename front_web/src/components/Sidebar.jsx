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
    useTheme,
    Collapse,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const drawerWidth = 280;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Monedas', icon: <AttachMoneyIcon />, path: '/monedas' },
    { text: 'Operaciones', icon: <SettingsEthernetIcon />, path: '/operaciones' },
    { text: 'Planilla Diaria', icon: <ReceiptLongIcon />, path: '/planillas' },
    { text: 'Cta. Cte. Clientes', icon: <AccountBoxIcon />, path: '/ctacte/cliente' },
    { text: 'Tipos Movimiento', icon: <SwapHorizIcon />, path: '/tipos-movimiento' },

    { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes' },
    { text: 'Productos', icon: <ShoppingBagIcon />, path: '/productos' },
    { text: 'Reportes', icon: <BarChartIcon />, path: '/reportes' },
    {
        text: 'Configuración',
        icon: <SettingsIcon />,
        children: [
            { text: 'Parámetros (CRUD)', icon: <SettingsIcon />, path: '/parametros' },
            { text: 'Colores Grid', icon: <SettingsIcon />, path: '/configuracion' }
        ]
    },
];

const Sidebar = ({ open, onClose }) => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const location = useLocation();
    const navigate = useNavigate();
    const [openSubmenus, setOpenSubmenus] = useState({});

    const handleToggle = (text) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [text]: !prev[text]
        }));
    };

    const renderMenuItem = (item, depth = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const active = location.pathname === item.path;
        const isOpen = openSubmenus[item.text] || false;

        // Auto-expand if child is active
        React.useEffect(() => {
            if (hasChildren) {
                const isChildActive = item.children.some(child => child.path === location.pathname);
                if (isChildActive && !openSubmenus[item.text]) {
                    setOpenSubmenus(prev => ({ ...prev, [item.text]: true }));
                }
            }
        }, [location.pathname]);

        const buttonSx = {
            borderRadius: '12px',
            bgcolor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: active ? 'primary.light' : 'rgba(255,255,255,0.7)',
            pl: 2 + (depth * 2), // Indentation
            mb: 1,
            '&:hover': {
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'white',
            },
        };

        if (hasChildren) {
            return (
                <React.Fragment key={item.text}>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton onClick={() => handleToggle(item.text)} sx={buttonSx}>
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }}
                            />
                            {isOpen ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {item.children.map(child => renderMenuItem(child, depth + 1))}
                            </List>
                        </Collapse>
                    </ListItem>
                </React.Fragment>
            );
        }

        return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={buttonSx}
                >
                    <ListItemIcon sx={{ color: active ? 'inherit' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
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
    };

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
                {menuItems.map(item => renderMenuItem(item))}
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
