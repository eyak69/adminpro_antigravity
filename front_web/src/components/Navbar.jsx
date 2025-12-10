import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Badge, Menu, MenuItem, ListItemText, ListItemIcon, Divider, Tooltip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNotification } from '../context/NotificationContext';

import MenuOpenIcon from '@mui/icons-material/MenuOpen';

const Navbar = ({ onSidebarOpen, onToggleCollapse, isSidebarCollapsed }) => {
    const { user, logout } = useAuth();
    const { unreadCount, notifications, clearNotifications } = useNotification();
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleLogout = () => {
        setAnchorElUser(null);
        logout();
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
        clearNotifications(); // Mark as 'read' visually when opened
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'error': return <ErrorIcon color="error" />;
            case 'success': return <CheckCircleIcon color="success" />;
            case 'warning': return <WarningIcon color="warning" />;
            default: return <InfoIcon color="info" />;
        }
    };

    return (
        <AppBar position="sticky" elevation={0}>
            <Toolbar sx={{ minHeight: 70 }}>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onSidebarOpen}
                    sx={{ mr: 2, display: { lg: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={onToggleCollapse}
                    sx={{ mr: 2, display: { xs: 'none', lg: 'inline-flex' } }}
                >
                    {isSidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
                </IconButton>

                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton color="inherit">
                        <SearchIcon />
                    </IconButton>

                    <IconButton color="inherit" onClick={handleMenuOpen}>
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                width: 320,
                                maxHeight: 400,
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                                Notificaciones del Sistema
                            </Typography>
                        </MenuItem>
                        <Divider />
                        {notifications.length === 0 ? (
                            <MenuItem disabled>
                                <ListItemText primary="Sin notificaciones" />
                            </MenuItem>
                        ) : (
                            notifications.map((notif, index) => (
                                <MenuItem key={index} onClick={handleMenuClose}>
                                    <ListItemIcon>
                                        {getIcon(notif.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={notif.message}
                                        secondary={new Date(notif.timestamp).toLocaleTimeString()}
                                        primaryTypographyProps={{ variant: 'body2', noWrap: false }}
                                    />
                                </MenuItem>
                            ))
                        )}
                    </Menu>

                    <Tooltip title="Abrir ajustes">
                        <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}>
                            <Avatar
                                src={user?.picture}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    border: '2px solid',
                                    borderColor: 'primary.main'
                                }}
                                alt={user?.name || 'User Profile'}
                            >
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        sx={{ mt: '45px' }}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={() => setAnchorElUser(null)}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                minWidth: 200,
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                    >
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 'bold' }}>
                                {user?.name || 'Usuario'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {user?.email || ''}
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Cerrar Sesión</ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
