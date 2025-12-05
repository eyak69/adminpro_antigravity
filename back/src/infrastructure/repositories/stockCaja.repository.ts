import { AppDataSource } from "../database/data-source";
import { StockCaja } from "../../domain/entities/StockCaja";

export const StockCajaRepository = AppDataSource.getRepository(StockCaja);
