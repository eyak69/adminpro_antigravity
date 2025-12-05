import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Badge, Menu, MenuItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useNotification } from '../context/NotificationContext';

const Navbar = ({ onSidebarOpen }) => {
    const { unreadCount, notifications, clearNotifications } = useNotification();
    const [anchorEl, setAnchorEl] = useState(null);

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

                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            cursor: 'pointer',
                            bgcolor: 'primary.main'
                        }}
                        alt="User Profile"
                    >
                        U
                    </Avatar>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
