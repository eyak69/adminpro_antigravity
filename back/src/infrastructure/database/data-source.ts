import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { Moneda } from "../../domain/entities/Moneda";
import { StockCaja } from "../../domain/entities/StockCaja";
import { Cliente } from "../../domain/entities/Cliente";
import { Operacion } from "../../domain/entities/Operacion";
import { TipoMovimiento } from "../../domain/entities/TipoMovimiento";
import { PlanillaDiaria } from "../../domain/entities/PlanillaDiaria";
import { CtaCteSaldo } from "../../domain/entities/CtaCteSaldo";
import { CtaCteMovimiento } from "../../domain/entities/CtaCteMovimiento";
import { SystemLog } from "../../domain/entities/SystemLog";

dotenv.config();

import { Parametro } from "../../domain/entities/Parametro";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false, // Don't use this in production
    logging: false,
    entities: [Moneda, StockCaja, Cliente, Operacion, TipoMovimiento, PlanillaDiaria, CtaCteSaldo, CtaCteMovimiento, SystemLog, Parametro],
    migrations: [],
    subscribers: [],
});
