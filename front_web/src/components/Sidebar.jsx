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
    Tooltip,
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

    {
        text: 'Configuración',
        icon: <SettingsIcon />,
        children: [
            { text: 'Parámetros (CRUD)', icon: <SettingsIcon />, path: '/parametros' },
            { text: 'Colores Grid', icon: <SettingsIcon />, path: '/configuracion' }
        ]
    },
];

const Sidebar = ({ open, onClose, isCollapsed }) => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const location = useLocation();
    const navigate = useNavigate();
    const [openSubmenus, setOpenSubmenus] = useState({});

    // Dynamic width
    const currentDrawerWidth = isCollapsed && isDesktop ? 80 : drawerWidth;

    const handleToggle = (text) => {
        if (isCollapsed) return; // Disable toggle in collapsed mode or handle differently
        setOpenSubmenus(prev => ({
            ...prev,
            [text]: !prev[text]
        }));
    };

    // Auto-expand checks... 
    React.useEffect(() => {
        if (!isCollapsed) {
            const newOpen = {};
            // Helper recursive check
            const checkItems = (items) => {
                items.forEach(item => {
                    if (item.children) {
                        const isChildActive = item.children.some(child => child.path === location.pathname);
                        if (isChildActive) {
                            newOpen[item.text] = true;
                        }
                        // Recursive if we had deeper levels, but here only 2 levels.
                    }
                });
            };
            checkItems(menuItems);

            if (Object.keys(newOpen).length > 0) {
                setOpenSubmenus(prev => ({ ...prev, ...newOpen }));
            }
        }
    }, [location.pathname, isCollapsed]);

    const renderMenuItem = (item, depth = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const active = location.pathname === item.path;
        const isOpen = openSubmenus[item.text] || false;

        const buttonSx = {
            borderRadius: '12px',
            bgcolor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: active ? 'primary.light' : 'rgba(255,255,255,0.7)',
            pl: isCollapsed ? 2 : 2 + (depth * 2), // Standard padding if collapsed
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            mb: 1,
            '&:hover': {
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'white',
            },
        };

        const icon = (
            <ListItemIcon sx={{
                color: active ? 'inherit' : 'rgba(255,255,255,0.7)',
                minWidth: isCollapsed ? 0 : 40,
                mr: isCollapsed ? 0 : 2,
                justifyContent: 'center'
            }}>
                {item.icon}
            </ListItemIcon>
        );

        if (hasChildren) {
            return (
                <React.Fragment key={item.text}>
                    <Tooltip title={isCollapsed ? item.text : ''} placement="right">
                        <ListItem disablePadding sx={{ display: 'block' }}>
                            <ListItemButton onClick={() => handleToggle(item.text)} sx={buttonSx}>
                                {icon}
                                {!isCollapsed && (
                                    <>
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }}
                                        />
                                        {isOpen ? <ExpandLess /> : <ExpandMore />}
                                    </>
                                )}
                            </ListItemButton>
                            {!isCollapsed && (
                                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                    <List disablePadding>
                                        {item.children.map(child => renderMenuItem(child, depth + 1))}
                                    </List>
                                </Collapse>
                            )}
                        </ListItem>
                    </Tooltip>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment key={item.text}>
                <Tooltip title={isCollapsed ? item.text : ''} placement="right">
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={() => navigate(item.path)}
                            sx={buttonSx}
                        >
                            {icon}
                            {!isCollapsed && (
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: active ? 600 : 400,
                                        fontSize: '0.95rem'
                                    }}
                                />
                            )}
                        </ListItemButton>
                    </ListItem>
                </Tooltip>
            </React.Fragment>
        );
    };

    const content = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
            <Box sx={{ p: isCollapsed ? 2 : 3, display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: 2, transition: 'all 0.3s' }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        minWidth: 40,
                        bgcolor: 'primary.main',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)'
                    }}
                >
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>M</Typography>
                </Box>
                {!isCollapsed && (
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap' }}>
                        AdminPro 2
                    </Typography>
                )}
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
                    width: currentDrawerWidth,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box',
                    '& .MuiDrawer-paper': {
                        width: currentDrawerWidth,
                        boxSizing: 'border-box',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        overflowX: 'hidden',
                    },
                }}
                open
            >
                {content}
            </Drawer>
        );
    }
    // Mobile drawer remains same
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
