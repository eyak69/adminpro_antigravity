import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Card, Text, Button, Avatar, ActivityIndicator } from 'react-native-paper';
import planillaService from '../services/planilla.service';

const HomeScreen = ({ user, onLogout }) => {
    const [balances, setBalances] = useState([]); // Daily movements
    const [historical, setHistorical] = useState([]); // Historical balances
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch real data in parallel
            const [dailyData, historicalData] = await Promise.all([
                planillaService.getDailyBalance(),
                planillaService.getHistoricalBalance()
            ]);
            setBalances(dailyData);
            setHistorical(historicalData);
        } catch (error) {
            console.error("Error loading dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header small>
                <Appbar.Content title="Dashboard" subtitle={`Hola, ${user?.name || 'Usuario'}`} />
                <Appbar.Action icon="refresh" onPress={loadDashboardData} />
                <Appbar.Action icon="logout" onPress={onLogout} />
            </Appbar.Header>

            <ScrollView style={styles.content}>

                {/* Saldo Histórico (Al Corte) */}
                <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#4caf50' }]}>
                    <Card.Title
                        title="Saldo Histórico"
                        subtitle="Total Acumulado al Corte"
                        left={(props) => <Avatar.Icon {...props} icon="bank" style={{ backgroundColor: '#4caf50' }} />}
                    />
                    <Card.Content>
                        {loading ? (
                            <ActivityIndicator animating={true} color="#4caf50" style={{ marginVertical: 20 }} />
                        ) : (
                            <View style={styles.balanceGrid}>
                                {historical && historical.length > 0 ? (
                                    historical.map((item) => (
                                        <View key={item.moneda.id} style={styles.balanceItem}>
                                            <Text variant="labelSmall" style={{ color: '#666' }}>{item.moneda.codigo}</Text>
                                            <Text variant="titleMedium" style={{
                                                fontWeight: 'bold',
                                                color: Number(item.saldo) < 0 ? '#d32f2f' : '#2e7d32'
                                            }}>
                                                $ {Number(item.saldo).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={{ textAlign: 'center', fontStyle: 'italic' }}>No hay saldo histórico.</Text>
                                )}
                            </View>
                        )}
                    </Card.Content>
                </Card>

                {/* Saldo Diario (Movimientos hoy) */}
                <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#0288d1' }]}>
                    <Card.Title
                        title="Movimientos del Día"
                        subtitle="Operaciones de Hoy"
                        left={(props) => <Avatar.Icon {...props} icon="calendar-today" style={{ backgroundColor: '#0288d1' }} />}
                    />
                    <Card.Content>
                        {loading ? (
                            <ActivityIndicator animating={true} color="#0288d1" style={{ marginVertical: 20 }} />
                        ) : (
                            <View style={styles.balanceGrid}>
                                {balances && balances.length > 0 ? (
                                    balances.map((item) => (
                                        <View key={item.moneda.id} style={styles.balanceItem}>
                                            <Text variant="labelSmall" style={{ color: '#666' }}>{item.moneda.codigo}</Text>
                                            <Text variant="titleMedium" style={{
                                                fontWeight: 'bold',
                                                color: Number(item.saldo) < 0 ? '#d32f2f' : '#2e7d32'
                                            }}>
                                                $ {Number(item.saldo).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={{ textAlign: 'center', fontStyle: 'italic' }}>No hay movimientos hoy.</Text>
                                )}
                            </View>
                        )}
                    </Card.Content>
                </Card>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

                <View style={styles.grid}>
                    <Button icon="plus" mode="contained-tonal" style={styles.gridItem} onPress={() => { }}>Nueva</Button>
                    <Button icon="format-list-bulleted" mode="contained-tonal" style={styles.gridItem}>Planillas</Button>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 10,
    },
    card: {
        marginBottom: 15,
        backgroundColor: 'white'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
        marginLeft: 5
    },
    grid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20
    },
    gridItem: {
        flex: 1,
    },
    balanceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10
    },
    balanceItem: {
        width: '48%', // 2 columns
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0'
    }
});

export default HomeScreen;
