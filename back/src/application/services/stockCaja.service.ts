import { StockCajaRepository } from "../../infrastructure/repositories/stockCaja.repository";
import { StockCaja } from "../../domain/entities/StockCaja";

export class StockCajaService {
    async getAll(): Promise<StockCaja[]> {
        return await StockCajaRepository.find({ relations: ["moneda"] });
    }

    async getById(id: number): Promise<StockCaja | null> {
        return await StockCajaRepository.findOne({
            where: { id },
            relations: ["moneda"],
        });
    }

    async create(data: Partial<StockCaja>): Promise<StockCaja> {
        const stock = StockCajaRepository.create(data);
        return await StockCajaRepository.save(stock);
    }

    async update(id: number, data: Partial<StockCaja>): Promise<StockCaja | null> {
        const stock = await this.getById(id);
        if (!stock) return null;
        StockCajaRepository.merge(stock, data);
        return await StockCajaRepository.save(stock);
    }

    async delete(id: number): Promise<boolean> {
        const result = await StockCajaRepository.softDelete(id);
        return result.affected !== 0;
    }
}
