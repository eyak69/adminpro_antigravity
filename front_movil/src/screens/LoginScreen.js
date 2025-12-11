import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Title } from 'react-native-paper';
import api from '../services/api';

const LoginScreen = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert("Error", "Completa todos los campos");

        setLoading(true);
        try {
            // Un-comment this when ready to connect real auth
            // const response = await api.post('/auth/login', { email, password });
            // onLoginSuccess(response.data);

            // FAKE LOGIN FOR DEMO
            setTimeout(() => {
                onLoginSuccess({ user: { name: "Usuario Demo" } });
            }, 1000);

        } catch (error) {
            console.error(error);
            Alert.alert("Login Fallido", "Credenciales incorrectas o error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.title}>Bienvenido al Sistema</Title>

                    <TextInput
                        label="Usuario / Email"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        style={styles.input}
                        autoCapitalize="none"
                        left={<TextInput.Icon icon="account" />}
                    />

                    <TextInput
                        label="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        mode="outlined"
                        secureTextEntry={!showPass}
                        style={styles.input}
                        right={<TextInput.Icon icon={showPass ? "eye-off" : "eye"} onPress={() => setShowPass(!showPass)} />}
                    />

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                    >
                        Ingresar
                    </Button>
                </Card.Content>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    card: {
        padding: 10,
        elevation: 4
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
        color: '#6200ee'
    },
    input: {
        marginBottom: 15,
        backgroundColor: 'white'
    },
    button: {
        marginTop: 10,
        paddingVertical: 6
    }
});

export default LoginScreen;
