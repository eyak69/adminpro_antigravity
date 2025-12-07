export const DEFAULT_PARAMS: Record<string, any> = {
    // Colors for Operation Grid
    "COLORESOPERACIONES": {
        "themeConfig": {
            "ENTRADA": {
                "textColor": "#1565c0",
                "rowColor": "#e3f2fd",
                "descripcion": "Entradas. Fila Azul suave."
            },
            "SALIDA": {
                "textColor": "#c62828",
                "rowColor": "#ffebee",
                "descripcion": "Salidas. Fila Rojo suave."
            },
            "COMPRA": {
                "textColor": "#1565c0",
                "rowColor": "#e3f2fd",
                "descripcion": "Acción de Compra"
            },
            "VENTA": {
                "textColor": "#c62828",
                "rowColor": "#ffebee",
                "descripcion": "Acción de Venta"
            },
            "CRUZADO": {
                "textColor": null,
                "rowColor": "#73f27e",
                "descripcion": "Intercambio de monedas. Fila Verde suave. El textColor SE MANTIENE según la acción original (Compra/Venta)."
            }
        }
    },

    // Balance Control enabled/disabled
    "CONTROLSALDO": false,

    // Restrictions on editing/anulling past transactions
    "EDITARPLANILLAFECHAANTERIOR": {
        "habilitado": true,
        "dias": 0
    }
};
