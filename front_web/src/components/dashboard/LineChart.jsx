import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const LineChart = ({ data, title }) => {
    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: 2, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="textSecondary">Sin datos suficientes para graficar</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 2, height: 300 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                {title}
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
                <RechartsLineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="compra" stroke="#1565c0" name="Compra" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="venta" stroke="#c62828" name="Venta" activeDot={{ r: 8 }} />
                </RechartsLineChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default LineChart;
