import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Card, Text, Avatar, ActivityIndicator, Divider } from 'react-native-paper';
import marketService from '../services/market.service';

const MarketScreen = ({ onLogout }) => {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMarketData();
    }, []);

    const loadMarketData = async () => {
        setLoading(true);
        try {
            const data = await marketService.getMarketRates();
            // FILTER: Only keep "Dolar" items
            const dollarRates = data.filter(item =>
                item.title.toLowerCase().includes('dolar') ||
                item.title.toLowerCase().includes('dólar') ||
                item.title.toLowerCase().includes('blue')
            );
            setRates(dollarRates);
        } catch (error) {
            console.error("Error loading market data", error);
        } finally {
            setLoading(false);
        }
    };

    const getVariationColor = (variationClass) => {
        if (variationClass === 'up') return '#4caf50';
        if (variationClass === 'down') return '#f44336';
        return '#757575';
    };

    const getVariationIcon = (variationClass) => {
        if (variationClass === 'up') return 'trending-up';
        if (variationClass === 'down') return 'trending-down';
        return 'minus';
    };

    return (
        <View style={styles.container}>
            <Appbar.Header small>
                <Appbar.Content title="Cotizaciones" subtitle="Dólar en Tiempo Real" />
                <Appbar.Action icon="refresh" onPress={loadMarketData} />
            </Appbar.Header>

            <ScrollView style={styles.content}>
                {loading ? (
                    <ActivityIndicator animating={true} size="large" style={{ marginTop: 50 }} />
                ) : (
                    <View>
                        {rates.map((item, index) => (
                            <Card key={index} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: getVariationColor(item.class_variation) }]}>
                                <Card.Content>
                                    <View style={styles.headerRow}>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.title}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Avatar.Icon
                                                size={24}
                                                icon={getVariationIcon(item.class_variation)}
                                                style={{ backgroundColor: 'transparent' }}
                                                color={getVariationColor(item.class_variation)}
                                            />
                                            <Text style={{ color: getVariationColor(item.class_variation), fontWeight: 'bold' }}>
                                                {item.variation}
                                            </Text>
                                        </View>
                                    </View>

                                    <Divider style={{ marginVertical: 10 }} />

                                    <View style={styles.ratesRow}>
                                        <View>
                                            <Text variant="bodySmall" style={{ color: '#757575' }}>COMPRA</Text>
                                            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                                                {item.compra !== null ? `$${item.compra}` : '-'}
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text variant="bodySmall" style={{ color: '#757575' }}>VENTA</Text>
                                            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                                                {item.venta !== null ? `$${item.venta}` : '-'}
                                            </Text>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))}
                    </View>
                )}
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
        paddingBottom: 20
    },
    card: {
        marginBottom: 15,
        backgroundColor: 'white'
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    ratesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
});

export default MarketScreen;
