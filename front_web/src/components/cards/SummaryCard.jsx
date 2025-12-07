import React from 'react';
import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const SummaryCard = ({ title, value, trend, trendValue, icon, color }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        bgcolor: `${color}.light`,
                        color: 'white',
                        background: (theme) => `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
                        boxShadow: (theme) => `0 4px 20px 0 ${theme.palette[color].main}40`
                    }}
                >
                    {icon}
                </Box>
                {trend && (
                    <Chip
                        icon={trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        label={trendValue}
                        color={trend === 'up' ? 'success' : 'error'}
                        size="small"
                        variant="soft"
                        sx={{ fontWeight: 'bold' }}
                    />
                )}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
        </CardContent>
    </Card>
);

export default SummaryCard;
