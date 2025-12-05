import { AppDataSource } from "../database/data-source";
import { Moneda } from "../../domain/entities/Moneda";

export const MonedaRepository = AppDataSource.getRepository(Moneda);
