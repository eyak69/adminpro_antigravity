export const DEFAULT_PARAMS: { [key: string]: any } = {
    // ... other params ...
    COLORESOPERACIONES: {
        "themeConfig": {
            "ENTRADA": {
                "textColor": "#1565c0",
                "rowColor": "#e3f2fd",
                "descripcion": "Entradas. Texto Azul, Fila Azul suave."
            },
            "SALIDA": {
                "textColor": "#c62828",
                "rowColor": "#ffebee",
                "descripcion": "Salidas. Texto Rojo, Fila Rojo suave."
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
    CONTROLSALDO: "true",
    EDITARPLANILLAFECHAANTERIOR: 0,
    SEGURIDADGOOGLE: "false",
    CONTROLPORIA: "false",
    TASADESVICION: { "habilitado": true, "valor": 1.5 }


};
