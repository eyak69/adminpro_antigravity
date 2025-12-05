import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Badge } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';

const Navbar = ({ onSidebarOpen }) => {
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

                    <IconButton color="inherit">
                        <Badge badgeContent={4} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

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
