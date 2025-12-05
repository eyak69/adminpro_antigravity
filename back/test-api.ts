async function testApi() {
    const baseUrl = "http://localhost:3000/api";

    console.log("--- Testing Moneda API ---");
    // 1. Create Moneda
    const monedaRes = await fetch(`${baseUrl}/monedas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            codigo: "USD",
            nombre: "Dolar Estadounidense",
            simbolo: "$",
            es_nacional: false,
        }),
    });
    const moneda = await monedaRes.json();
    console.log("Created Moneda:", moneda);

    // 2. Get All Monedas
    const monedasRes = await fetch(`${baseUrl}/monedas`);
    const monedas = await monedasRes.json();
    console.log("All Monedas:", monedas);

    let monedaId = moneda.id;
    if (!monedaId) {
        // If creation failed (e.g. duplicate), try to find existing one
        const existing = monedas.find((m: any) => m.codigo === 'USD');
        if (existing) {
            console.log("Using existing Moneda ID:", existing.id);
            monedaId = existing.id;
        } else {
            console.error("Failed to create or find Moneda, stopping test.");
            return;
        }
    }

    console.log("\n--- Testing StockCaja API ---");
    // 3. Create StockCaja
    const stockRes = await fetch(`${baseUrl}/stock-caja`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            moneda: { id: monedaId },
            saldo_actual: 1000.50,
        }),
    });
    const stock = await stockRes.json();
    console.log("Created StockCaja:", stock);

    // 4. Get All StockCaja
    const stocksRes = await fetch(`${baseUrl}/stock-caja`);
    const stocks = await stocksRes.json();
    console.log("All StockCaja:", stocks);

    console.log("\n--- Testing Cliente API ---");
    // 5. Create Cliente
    const clienteRes = await fetch(`${baseUrl}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            alias: "Juan Perez",
            nombre_real: "Juan Carlos Perez",
            documento: "12345678",
            notas: "Cliente preferencial",
            es_moroso: false,
        }),
    });
    const cliente = await clienteRes.json();
    console.log("Created Cliente:", cliente);

    // 6. Get All Clientes
    const clientesRes = await fetch(`${baseUrl}/clientes`);
    const clientes = await clientesRes.json();
    console.log("All Clientes:", clientes);

    // 7. Get Cliente by Alias
    const clienteAliasRes = await fetch(`${baseUrl}/clientes/alias/Juan Perez`);
    const clienteAlias = await clienteAliasRes.json();
    console.log("Cliente by Alias:", clienteAlias);

    console.log("\n--- Testing Operacion API ---");
    // 8. Get All Operaciones (Should include seeded data)
    const operacionesRes = await fetch(`${baseUrl}/operaciones`);
    const operaciones = await operacionesRes.json();
    console.log("All Operaciones:", operaciones);

    // 9. Create Operacion
    const operacionRes = await fetch(`${baseUrl}/operaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: "NUEVA OPERACION TEST",
        }),
    });
    const operacion = await operacionRes.json();
    console.log("Created Operacion:", operacion);

    console.log("\n--- Testing TipoMovimiento API ---");
    // 10. Get All TiposMovimiento (Should include seeded data)
    const tiposRes = await fetch(`${baseUrl}/tipos-movimiento`);
    const tipos = await tiposRes.json();
    console.log("All TiposMovimiento:", tipos);

    // 11. Create TipoMovimiento
    // Need an Operacion ID. Let's use the one we created or one from seed.
    const operacionId = operacion.id || 1;

    const tipoMovRes = await fetch(`${baseUrl}/tipos-movimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: "TIPO MOVIMIENTO TEST",
            tipo_accion: "NEUTRO",
            contabilizacion: "NEUTRO",
            operacionId: operacionId,
            requiere_persona: true
        }),
    });
    const tipoMov = await tipoMovRes.json();
    console.log("Created TipoMovimiento:", tipoMov);

    console.log("\n--- Testing PlanillaDiaria API ---");
    // 12. Get All Planilla Entries (Should include seeded data)
    const planillaRes = await fetch(`${baseUrl}/planilla`);
    const planilla = await planillaRes.json();
    console.log("All Planilla Entries:", planilla);

    // 13. Create Planilla Entry (Gasto simple)
    const planillaEntryRes = await fetch(`${baseUrl}/planilla`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tipoMovimientoId: tipoMov.id,
            clienteId: cliente.id,
            observaciones: "Test Planilla Entry",
            monto_ingreso: 100,
            monto_egreso: 0
        }),
    });
    const planillaEntry = await planillaEntryRes.json();
    console.log("Created Planilla Entry:", planillaEntry);

    console.log("\n--- Testing Cta Cte API ---");
    // 14. Get Saldo (Should be 500 USD from seed)
    // Need Cliente ID (SeedClient) and Moneda ID (USD)
    // Let's create a new client and test manually to be sure

    const clienteCtaCteRes = await fetch(`${baseUrl}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            alias: "CtaCteTest",
            nombre_real: "Cliente Cta Cte Test",
            documento: "88888888",
            es_moroso: false,
        }),
    });
    const clienteCtaCte = await clienteCtaCteRes.json();
    console.log("Created Cliente for Cta Cte:", clienteCtaCte);

    // 15. Register Movimiento (DEBITO 200)
    const movDebitoRes = await fetch(`${baseUrl}/cta-cte/movimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            clienteId: clienteCtaCte.id,
            monedaId: monedaId, // USD
            tipo: "DEBITO",
            monto: 200,
            observaciones: "Test Debito API"
        }),
    });
    console.log("Registered DEBITO 200 status:", movDebitoRes.status);

    // 16. Get Saldo (Should be 200)
    const saldoRes = await fetch(`${baseUrl}/cta-cte/saldo/${clienteCtaCte.id}/${monedaId}`);
    const saldo = await saldoRes.json();
    console.log("Saldo after DEBITO:", saldo);

    // 17. Register Movimiento (CREDITO 50)
    const movCreditoRes = await fetch(`${baseUrl}/cta-cte/movimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            clienteId: clienteCtaCte.id,
            monedaId: monedaId, // USD
            tipo: "CREDITO",
            monto: 50,
            observaciones: "Test Credito API"
        }),
    });
    console.log("Registered CREDITO 50 status:", movCreditoRes.status);

    // 18. Get Saldo (Should be 150)
    const saldoFinalRes = await fetch(`${baseUrl}/cta-cte/saldo/${clienteCtaCte.id}/${monedaId}`);
    const saldoFinal = await saldoFinalRes.json();
    console.log("Saldo after CREDITO:", saldoFinal);

    // 19. Get Movimientos
    const movimientosRes = await fetch(`${baseUrl}/cta-cte/movimientos/${clienteCtaCte.id}`);
    const movimientos = await movimientosRes.json();
    console.log("Movimientos:", movimientos);

    console.log("\n--- Testing Transaction API (TransactionService) ---");
    // 20. Execute Transaction (VENTA DE BILLETE)
    // Need: TipoMovimiento VENTA (ID 1 from seed), Moneda USD (ID 1), Monto 100, Cotizacion 1000
    // This should:
    // - Create Planilla Entry
    // - Update Stock (Decrement USD, Increment ARS)
    // - NOT update Cta Cte (graba_cta_cte is false for VENTA)

    const transaccionRes = await fetch(`${baseUrl}/v1/transacciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tipoMovimientoId: 1, // VENTA DE BILLETE
            monto: 100,
            monedaId: 1, // USD
            cotizacion: 1000,
            observaciones: "Test Transaction API Venta"
        }),
    });

    if (transaccionRes.status === 200) {
        const transaccion = await transaccionRes.json();
        console.log("Transaction VENTA Success:", transaccion);
    } else {
        const error = await transaccionRes.json();
        console.error("Transaction VENTA Failed:", error);
    }

    // 21. Execute Transaction (Cta Cte DEBITO via TransactionService)
    // Need: TipoMovimiento DEBITO CTA CTE (Need to find ID, let's assume we created one or use seed)
    // Actually, seed has "MOVIMIENTO DE CTA CTE" but we need to check if it's configured correctly.
    // Let's use the one we created in previous tests if possible, or just skip if too complex to find ID dynamically without querying.
    // For now, let's verify VENTA worked by checking Stock.

    const stockCheckRes = await fetch(`${baseUrl}/stock-caja`);
    const stockCheck = await stockCheckRes.json();
    console.log("Stock Check after Transaction:", stockCheck);
}

testApi().catch(console.error);
