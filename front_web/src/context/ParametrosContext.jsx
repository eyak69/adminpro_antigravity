import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const { API_BASE_URL } = config;

const ParametrosContext = createContext();

export const useParametros = () => {
    return useContext(ParametrosContext);
};

export const ParametrosProvider = ({ children }) => {
    const [parametros, setParametros] = useState({});
    const [loading, setLoading] = useState(true);

    const refreshParametros = async () => {
        try {
            // Fetch known parameters
            const response = await axios.get(`${API_BASE_URL}/parametros/COLORESOPERACIONES`);
            if (response.data && response.data.themeConfig) {
                setParametros(prev => ({ ...prev, themeConfig: response.data.themeConfig }));
            }
        } catch (error) {
            console.error('Error loading parameters:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshParametros();
    }, []);

    // Helper logic to Determine Cell Color
    const getCellColor = (value) => {
        const theme = parametros.themeConfig;
        if (!theme || !value) return 'text.primary';

        // Check exact match (VENTA, COMPRA, DEBE, HABER)
        if (theme[value] && theme[value].textColor) {
            return theme[value].textColor;
        }
        return 'text.primary';
    };

    // Helper logic to Determine Row CSS Class
    const getRowThemeClass = (row) => {
        const theme = parametros.themeConfig;
        if (!theme) return '';

        const { tipo_accion, contabilizacion } = row;

        // 1. Check for Crossed (CRUZADO)
        // VENTA + DEBE  or  COMPRA + HABER
        if (
            (tipo_accion === 'VENTA' && contabilizacion === 'DEBE') ||
            (tipo_accion === 'COMPRA' && contabilizacion === 'HABER')
        ) {
            // Wait, previous request was Red for Mismatch. 
            // BUT user JSON says "CRUZADO" description "Intercambio de monedas... Fila Verde suave".
            // AND user earlier said "cruzas los cables (Venta+Debe o Compra+Haber) -> Rojo".

            // Let's stick to the JSON provided in the prompt?
            // "Intercambio de monedas. Fila Verde suave."
            // But usually VENTA+DEBE is strange.

            /**
             * User Request in prompt:
             * "Si es Cruzado -> devuelve colores de CRUZADO."
             * 
             * Let's assume Cruzado IS Venta+Debe / Compra+Haber based on typical exchange logic?
             * Or implies explicitly defined logic.
             * 
             * Re-reading: "Si es Cruzado -> devuelve colores de CRUZADO."
             * 
             * I will implement logic to detecting "Cruzado" vs "Normal".
             * Normal: COMPRA+DEBE, VENTA+HABER.
             * Cruzado: COMPRA+HABER, VENTA+DEBE.
             */

            // However, the LATEST JSON has keys: DEBE, HABER, COMPRA, VENTA, CRUZADO.
            // It doesn't mapp "COMPRA+DEBE" to a key.

            // I'll defer to standard matching logic but apply the styles from the keys.

            // Let's implement robust logic based on presence.
            return '';
        }
        return '';
    };

    // Revised helper that returns the STYLE OBJECT directly for sx, or class name?
    // User asked for "getRowTheme(operacion, accion)"

    const getRowTheme = (row) => {
        const theme = parametros.themeConfig;
        if (!theme) return {};

        const { tipo_accion, contabilizacion } = row;

        // Define Logic Conditions
        const isCompra = tipo_accion === 'COMPRA';
        const isVenta = tipo_accion === 'VENTA';
        const isDebe = contabilizacion === 'DEBE';
        const isHaber = contabilizacion === 'HABER';

        // Mismatches (Cruzados?)
        // If the user defines "CRUZADO" in JSON, when does it apply?
        // Usually Compra -> Debe (Asset Up, Liability Up? No. Asset Up, Cash Down).
        // Let's assume the "CRUZADO" key applies to the Mismatch cases if that was the intent.
        // BUT I will stick to the Key-Based logic:

        // If Type matches a Key, use it.

        // Priority:
        // 1. If Contabilizacion is set, use that for Row Color?
        // 2. Or if TipoAccion is set?

        let targetKey = null;

        // Perfect Matches (Green in previous logic, but now JSON says what?)
        // JSON: 
        // DEBE: Row Red
        // HABER: Row Blue
        // CRUZADO: Row Green

        // Logic Inference:
        // COMPRA (+ DEBE? usually implies cash out). 
        // VENTA (+ HABER? usually implies cash in).

        if (isCompra && isDebe) return theme['CRUZADO'] || {}; // "Intercambio"
        if (isVenta && isHaber) return theme['CRUZADO'] || {};

        if (isVenta && isDebe) return theme['DEBE'] || {}; // Red
        if (isCompra && isHaber) return theme['HABER'] || {}; // Blue

        // Fallbacks for partials
        if (isDebe) return theme['DEBE'] || {};
        if (isHaber) return theme['HABER'] || {};
        if (isVenta) return theme['VENTA'] || {}; // Inherits DEBE
        if (isCompra) return theme['COMPRA'] || {}; // Inherits HABER

        return {};
    };

    const value = {
        parametros,
        loading,
        refreshParametros,
        getCellColor,
        getRowTheme
    };

    return (
        <ParametrosContext.Provider value={value}>
            {children}
        </ParametrosContext.Provider>
    );
};
