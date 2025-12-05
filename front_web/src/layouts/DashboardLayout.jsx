import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Sidebar
                open={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Navbar onSidebarOpen={() => setSidebarOpen(true)} />

                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardLayout;
