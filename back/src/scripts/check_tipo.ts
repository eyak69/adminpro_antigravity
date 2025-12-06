import "reflect-metadata";
import { AppDataSource } from "../infrastructure/database/data-source";
import { TipoMovimiento } from "../domain/entities/TipoMovimiento";

const main = async () => {
    try {
        await AppDataSource.initialize();
        const repo = AppDataSource.getRepository(TipoMovimiento);
        const tipos = await repo.findByIds([1, 2, 5, 18]);

        tipos.forEach(tipo => {
            console.log("------------------------------------------------");
            console.log("ID:", tipo.id);
            console.log("Nombre:", tipo.nombre);
            console.log("Accion:", tipo.tipo_accion);
            console.log("Contabilizacion:", tipo.contabilizacion);
            console.log("Requiere Cotizacion:", tipo.requiere_cotizacion);
        });
        console.log("------------------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

main();
