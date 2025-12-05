async function testTransactionService() {
    const baseUrl = "http://localhost:3000/api/v1/transacciones";
    const stockUrl = "http://localhost:3000/api/stock-caja";
    const ctaCteUrl = "http://localhost:3000/api/cta-cte";

    console.log("=== INICIANDO TEST DE TRANSACTION SERVICE ===");

    // Helper to get Stock
    const getStock = async (monedaId: number) => {
        const res = await fetch(stockUrl);
        const stocks = await res.json();
        const stock = stocks.find((s: any) => s.moneda.id === monedaId);
        return stock ? parseFloat(stock.saldo_actual) : 0;
    };

    // Helper to get Cta Cte Saldo
    const getSaldo = async (clienteId: number, monedaId: number) => {
        const res = await fetch(`${ctaCteUrl}/saldo/${clienteId}/${monedaId}`);
        const data = await res.json();
        return parseFloat(data.saldo);
    };

    // IDs (Based on Seed)
    const MONEDA_USD = 1;
    const MONEDA_ARS = 6; // Assuming ARS is 6 based on previous logs
    const TIPO_VENTA = 1; // VENTA DE BILLETE
    const TIPO_COMPRA = 2; // COMPRA DE BILLETE (Need to verify ID from seed or fetch)
    const TIPO_GASTO = 3; // GASTOS EN PESOS
    // We need to find a Cta Cte movement type. 
    // Let's fetch types to be sure.
    const tiposRes = await fetch("http://localhost:3000/api/tipos-movimiento");
    const tipos = await tiposRes.json();

    const tipoVenta = tipos.find((t: any) => t.nombre === "VENTA DE BILLETE");
    const tipoCompra = tipos.find((t: any) => t.nombre === "COMPRA DE BILLETE");
    // Find a type that affects Cta Cte. The seed has "MOVIMIENTO DE CTA CTE" but let's check config.
    // If not configured in seed, we might need to create one or use the one we created in test-api.ts if it persists (it won't if we restart DB, but we are using persistent DB).
    // Let's assume we use the "SeedClient" (ID 7 usually) or create a new one.

    // Create a fresh client for this test
    const clienteRes = await fetch("http://localhost:3000/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias: "TestTransaccion", nombre_real: "Tester", documento: "111", es_moroso: false })
    });
    const cliente = await clienteRes.json();
    console.log(`Cliente creado: ${cliente.alias} (ID: ${cliente.id})`);

    // --- TEST 1: VENTA DE BILLETE (Caja) ---
    console.log("\n--- TEST 1: VENTA DE BILLETE (100 USD @ 1000 ARS) ---");
    const initialStockUSD = await getStock(MONEDA_USD);
    const initialStockARS = await getStock(MONEDA_ARS);
    console.log(`Stock Inicial - USD: ${initialStockUSD}, ARS: ${initialStockARS}`);

    const ventaRes = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tipoMovimientoId: tipoVenta.id,
            monto: 100,
            monedaId: MONEDA_USD,
            cotizacion: 1000,
            observaciones: "Test Venta Script"
        })
    });
    const ventaData = await ventaRes.json();

    if (ventaRes.status === 200) {
        console.log("✅ Venta Exitosa");
        const finalStockUSD = await getStock(MONEDA_USD);
        const finalStockARS = await getStock(MONEDA_ARS);
        console.log(`Stock Final - USD: ${finalStockUSD} (Esperado: ${initialStockUSD - 100})`);
        console.log(`Stock Final - ARS: ${finalStockARS} (Esperado: ${initialStockARS + 100000})`);
    } else {
        console.error("❌ Venta Fallida:", ventaData);
    }

    // --- TEST 2: COMPRA DE BILLETE (Caja) ---
    console.log("\n--- TEST 2: COMPRA DE BILLETE (50 USD @ 900 ARS) ---");
    // Need to ensure we have enough ARS. We just got 100,000 ARS so we are good.
    const compraRes = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tipoMovimientoId: tipoCompra.id,
            monto: 50,
            monedaId: MONEDA_USD,
            cotizacion: 900,
            observaciones: "Test Compra Script"
        })
    });
    const compraData = await compraRes.json();

    if (compraRes.status === 200) {
        console.log("✅ Compra Exitosa");
        const finalStockUSD = await getStock(MONEDA_USD);
        const finalStockARS = await getStock(MONEDA_ARS);
        console.log(`Stock Final - USD: ${finalStockUSD} (Esperado Anterior + 50)`);
        console.log(`Stock Final - ARS: ${finalStockARS} (Esperado Anterior - 45000)`);
    } else {
        console.error("❌ Compra Fallida:", compraData);
    }

    // --- TEST 3: MOVIMIENTO CTA CTE (Debito - Genera Deuda) ---
    console.log("\n--- TEST 3: MOVIMIENTO CTA CTE (DEBITO 500 USD) ---");
    // We need a TipoMovimiento that has graba_cta_cte = true.
    // Let's create one on the fly to be sure.
    const tipoCtaCteRes = await fetch("http://localhost:3000/api/tipos-movimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: "PRESTAMO USD",
            tipo_accion: "SALIDA", // Sale dinero de caja (se lo damos al cliente)
            contabilizacion: "HABER", // Sale de caja -> DEBITO en Cta Cte (Cliente nos debe)
            requiere_persona: true,
            graba_cta_cte: true,
            operacionId: 1 // VARIOS
        })
    });
    const tipoCtaCte = await tipoCtaCteRes.json();
    console.log("Tipo Movimiento Cta Cte Creado:", tipoCtaCte.nombre);

    const initialSaldo = await getSaldo(cliente.id, MONEDA_USD);
    console.log(`Saldo Inicial Cta Cte: ${initialSaldo}`);

    const prestamoRes = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tipoMovimientoId: tipoCtaCte.id,
            monto: 500,
            monedaId: MONEDA_USD,
            clienteId: cliente.id,
            cotizacion: 1,
            observaciones: "Prestamo Test"
        })
    });
    const prestamoData = await prestamoRes.json();

    if (prestamoRes.status === 200) {
        console.log("✅ Prestamo (Cta Cte) Exitoso");
        const finalSaldo = await getSaldo(cliente.id, MONEDA_USD);
        console.log(`Saldo Final Cta Cte: ${finalSaldo} (Esperado: ${initialSaldo + 500})`);

        // Verify Stock impact (SALIDA)
        const stockUSD = await getStock(MONEDA_USD);
        console.log(`Stock USD tras prestamo: ${stockUSD} (Debió bajar 500)`);
    } else {
        console.error("❌ Prestamo Fallido:", prestamoData);
    }
}

testTransactionService().catch(console.error);
